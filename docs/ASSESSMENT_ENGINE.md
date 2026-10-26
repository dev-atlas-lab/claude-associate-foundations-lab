# Assessment Engine

**Status:** assessment core implemented (Phase C2.1); reviewed Domain 2 bank and lesson completed
(Phase C2.2b, 2026-10-26)  
**Scope:** deterministic single-choice and multiple-response assessment core, plus 14 reviewed
Domain 2 practice items, one Domain 2 lesson, and one unmapped Context Window sample. This is **not**
a complete practice bank, a 60-item mock exam, or an official score predictor.

## 1. Where the code lives

| Concern | Module |
|---|---|
| Schemas, policies, sessions, scoring, state transitions | `src/domain/assessment.ts` |
| Question-bank schema and review metadata | `src/domain/question-bank.ts` |
| Cross-reference validation at content-pack load | `src/domain/content-pack.ts` |
| CCAO-F assessment definitions | `src/content/certifications/claude-associate-foundations/assessments.ts` |
| Reviewed Domain 2 question bank | `src/content/certifications/claude-associate-foundations/question-bank.ts` |
| Question resolution and registry lookups | `src/content/index.ts` |
| Practice page integration | `src/pages/PracticePage.tsx` |
| Reusable runner UI | `src/features/assessment/components/AssessmentRunner.tsx` |
| Immediate lesson knowledge-check UI | `src/features/curriculum/components/KnowledgeCheck.tsx` |
| Runner styles | `src/styles/assessment.css` |

The assessment core does not import React, a router, a timer, localStorage, or any CCAO-F constant.
Certification-specific data lives under `src/content/`.

## 2. Domain model

### Assessment definition

```ts
interface AssessmentDefinition {
  id: string;                 // stable kebab-case id
  title: string;
  description?: string;
  questionIds: string[];      // authored order; validated against the registry
  policy: {
    scoring: "all-or-nothing";
    allowAnswerChangesBeforeSubmit: boolean;
  };
}
```

The definition is the authored identity of an assessment. It contains no answers, scores, or
per-session state. Duplicate question references are rejected by the cross-reference validator rather
than silently deduplicated.

### Session

```ts
interface AssessmentSession {
  id: string;                         // injected; no Date.now() or randomness in the core
  assessmentId: string;
  status: "in-progress" | "submitted";
  currentQuestionIndex: number;
  answers: Record<string, string[]>;  // question id -> selected choice ids; empty answers omitted
  flaggedQuestionIds: string[];
  startedAt: string;                  // ISO-8601 UTC timestamp
  submittedAt?: string;               // required when submitted
}
```

Scores are **not** stored in the session. They are derived from the submitted answers on demand, so
there is no mutable score state that can drift from the answers.

Only `in-progress` and `submitted` are modelled. `expired` is deliberately absent because this phase
has no timer or expiry transition; adding an unreachable state would be misleading. A timer phase
must add expiry explicitly rather than overloading submission.

### Result

`calculateAssessmentResult` returns:

- total questions, answered questions, correct answers, incorrect answers, unanswered questions;
- raw percentage, rounded to two decimals;
- per-question outcome (`correct`, `incorrect`, `unanswered`), selected ids, and correct ids;
- assessment id, session id, and the original submission timestamp.

Explanations are **not** part of the result. The UI joins the result to the question data, keeping
scoring separate from authored answer explanations.

### Question-bank entry

A reviewed bank entry wraps the existing `Question` schema instead of defining a parallel question
model:

```ts
interface QuestionBankEntry {
  question: Question;              // same schema used by lessons and assessments
  certificationId: string;
  blueprintId: string;
  examMapping: {
    status: "candidate" | "verified"; // "unmapped" is rejected for bank entries
    objectiveIds: string[];
    note: string;
  };
  contentStatus: "draft" | "reviewed" | "published";
  verification: Verification;      // checked date, note, and source ids
}
```

The bank entry must be mapped to at least one objective. Unmapped design samples stay inside a
lesson, which is why the Context Window sample is not in the bank. Bank entries also enforce:

- `published` requires verified content, through the shared content-status rule;
- a `verified` exam mapping requires verified content;
- every question-level source must appear in the review's `verification.sourceIds`;
- duplicate question ids across lessons and the bank are rejected;
- blueprint, certification, objective, and source references must resolve at content-pack load.

The completed Domain 2 bank covers all six objectives:

| Objective | Items | Formats |
|---|---|---|
| `output-evaluate-accuracy` | `output-accuracy-review-plan`, `output-accurate-but-incomplete` | single-choice |
| `output-identify-hallucinations` | `output-fabricated-policy-detail`, `output-hallucination-signals`, `output-bias-one-sided-framing`, `output-bias-unequal-standards` | single-choice, multiple-response |
| `output-fact-check` | `output-fact-check-retention`, `output-reduce-unsupported-claims` | single-choice, multiple-response |
| `output-human-review` | `output-human-review-high-stakes`, `output-human-review-triggers` | single-choice, multiple-response |
| `output-edit-adapt` | `output-edit-preserve-facts`, `output-compare-customer-faq-drafts` | single-choice, multiple-response |
| `output-format-selection` | `output-format-fit-deliverable`, `output-format-decisions` | single-choice, multiple-response |

Bias is part of the official `output-identify-hallucinations` wording. The two bias items are
grounded in Claude's Constitution and are limited to one-sided evidence selection, loaded framing,
unequal standards, and protected-characteristic assumptions. The Constitution is not a comprehensive
fairness-evaluation methodology, so the bank and lesson do not claim one.

## 3. Validation and errors

`validateAssessmentDefinition` reports:

- `empty-assessment`;
- `duplicate-question-id`;
- `missing-question`.

`createAssessmentContext` throws `AssessmentDefinitionError` with all issues when validation fails.
The content pack runs the same validation at import time, so a broken assessment reference fails the
build and tests instead of rendering an empty runner.

State operations throw `AssessmentStateError` with a typed code:

| Code | When |
|---|---|
| `wrong-assessment` | Session belongs to a different assessment definition |
| `unknown-question` | Question id is not part of the assessment |
| `unknown-choice` | Choice id is not part of the referenced question |
| `invalid-selection` | Duplicate choice ids, or more than one selection for single-choice |
| `answer-changes-not-allowed` | Policy forbids replacing an existing answer |
| `index-out-of-range` | Navigation target is outside the definition |
| `session-not-in-progress` | Answer or flag mutation after submission |
| `session-not-submitted` | Result requested before submission |

Content questions themselves are validated by the existing `questionSchema`, including duplicate
choice ids, correct-choice references, and the single-choice / multiple-response cardinality rules.
The bank adds metadata around that schema; no parallel question schema exists.

## 4. State transitions

All transitions are pure: they return a new session and never mutate the input.

| Operation | Behaviour |
|---|---|
| `startAssessment` | Creates an in-progress session at index 0 with no answers or flags. |
| `chooseAnswer` | Replaces the answer set for one question; an empty array clears the answer. |
| `toggleAnswerChoice` | Radio-style replace for single-choice; checkbox-style toggle for multiple-response. |
| `goToQuestion` | Moves to an in-range index; out-of-range indexes are rejected. |
| `goToNextQuestion` / `goToPreviousQuestion` | Return the same session at the boundaries. |
| `toggleQuestionFlag` | Adds or removes a flag in progress; flags are locked after submission. |
| `submitAssessment` | Sets `submitted` and `submittedAt`, then derives the result. |
| `calculateAssessmentResult` | Requires a submitted session; deterministic for the same session. |

Submission is idempotent: submitting an already-submitted session returns the **same** session
object and a result derived from the original answers and original timestamp. Later submission times
are ignored.

Review navigation remains available after submission. Answer inputs and flag controls are locked;
the navigator lets the learner inspect every question and its explanation.

## 5. Scoring rules

- **Single-choice:** correct only when the selected set is exactly the one correct choice.
- **Multiple-response:** correct only when the selected set exactly equals the correct set. Order is
  irrelevant; a subset, superset, or duplicate selection is incorrect.
- **Unanswered:** a question with no stored selection is `unanswered`. It is never correct. It is
  counted separately from answered-but-wrong questions, so both numbers remain visible.
- **No partial credit:** the only implemented scoring mode is `all-or-nothing`.
- **Raw percentage:** `round(correct / total * 100, 2)`. Unanswered questions reduce the percentage
  exactly as wrong answers do.

### What the raw percentage is not

The raw percentage is a local practice metric. It is **not** the official CCAO-F scaled score on the
100–1,000 range, is **not** converted with an invented formula, and does **not** predict a pass/fail
result. The UI states this next to the result.

## 6. Policies and certification neutrality

`AssessmentPolicy` currently exposes:

- `scoring: "all-or-nothing"` — only exact-set scoring, because no official policy requiring partial
  credit has been verified;
- `allowAnswerChangesBeforeSubmit` — data-specific behaviour, so a future exam mode can lock answers
  without changing the core.

Question count, question order, pass thresholds, timers, and per-domain weights are **not** hard-coded
into the core. The CCAO-F sample uses one question and no timer; that is content configuration, not
engine behaviour.

## 7. UI integration

`AssessmentRunner` is the reusable session UI. It renders:

- a start screen with English assessment instructions and a clear "not official exam content" label;
- one question at a time with accessible radio or checkbox controls;
- answered / unanswered state and a question navigator;
- flag and unflag controls;
- previous / next buttons that respect boundaries;
- an explicit submission confirmation that states how many questions are unanswered and that answers
  cannot be changed afterwards;
- a Vietnamese result summary, raw-percentage disclaimer, per-question outcome, and Vietnamese
  explanations for every option.

The Practice page now runs the reviewed `domain-2-output-validation-set` definition from the content
registry: 14 original items across all six Domain 2 objectives, both question formats, and Vietnamese
explanations after submission. The page is still a bank preview, not full Practice Mode: there is no
set selection, filtering, persistence, or attempt history. The Context Window sample assessment
remains in the pack and its lesson keeps the immediate `KnowledgeCheck`; that sample is still
explicitly unmapped to an official CCAO-F objective. The Domain 2 lesson also keeps its own
`KnowledgeCheck` and links to reviewed bank items through `relatedQuestionIds`; both surfaces use the
same exact-set scoring function (`isAnswerCorrect`).

## 8. Deliberate non-goals for C2.1 / C2.2b

- No timer, auto-submit, or expiry.
- No localStorage persistence or schema migrations.
- No 60-question mock exam and no complete bank for all 30 objectives. The current bank is 14
  reviewed Domain 2 items only.
- No practice-mode set selection, filters, attempt history, or review queue.
- No per-domain score report.
- No official scaled-score conversion or pass prediction.
- No partial credit.
- No official exam questions or third-party exam dumps. Every bank item is original.
- No changes to the content model's language policy: questions and instructions are English;
  explanations and result copy are Vietnamese.

## 9. Test coverage

`src/test/assessment.test.ts` covers definition validation, start state, single-choice correctness,
exact-set multiple-response scoring, missing answers, invalid choice ids, navigation boundaries,
flags, answer changes before submission, locked answers after submission, repeated submission, mixed
question types, and raw-percentage rounding.

`src/test/assessment-ui.test.tsx` covers the runner journey: start, answer, change answer, navigate,
flag, submit confirmation/cancel, exact-set scoring, result metrics, explanations, review navigation,
unanswered handling, disabled inputs, and starting a new attempt.

`src/test/question-bank.test.ts` covers the 14-entry bank, at least two items per Domain 2 objective,
both question formats, English-only learner-facing text, Vietnamese explanations for every option,
source and verification references, unmapped-entry rejection, question-id uniqueness across lessons
and bank, lesson-to-bank reference validation, and blueprint/certification/objective source
validation.

`src/test/domain-2-content.test.tsx` covers the published Domain 2 lesson, six-objective mapping,
reviewed-question links, source/verification references, English/Vietnamese language checks, the
unmapped Context Window boundary, lesson route rendering, and the lesson knowledge-check journey.

`src/test/practice-page.test.tsx` verifies that `/practice` runs the reviewed 14-item Domain 2 set
rather than the unmapped sample and keeps both lesson links working.

## 10. Next step

Build Practice Mode selection and persistence on top of the reviewed bank, or expand the bank beyond
Domain 2 before starting the Mock Exam foundation. The assessment core and bank schema are ready; the
next bottleneck is reviewed content for the remaining 24 objectives and saved attempt state. Timer
behaviour should remain a separate, versioned layer rather than being embedded in scoring.
