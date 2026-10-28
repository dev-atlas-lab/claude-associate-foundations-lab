# Assessment Engine

**Status:** assessment core, local persistence, registry-driven practice sets, review queue, progress
report, and a mock-exam preview implemented (Phase C2.3, 2026-10-27); content coverage completed in
Phase C2.4 and extended in Phase C2.5; browser/accessibility regression audit in Phase C2.6 (2026-10-28).
**Scope:** deterministic single-choice and multiple-response scoring, 62 reviewed items across all
seven domains, versioned localStorage attempts, derived review queue and progress, and a 60-of-60
blueprint-weighted mock-exam preview drawn from 62 items. This is **not** a timed simulation or an
official score predictor.

## 1. Where the code lives

| Concern | Module |
|---|---|
| Schemas, policies, sessions, scoring, state transitions | `src/domain/assessment.ts` |
| Question-bank schema and review metadata | `src/domain/question-bank.ts` |
| Persisted attempt, origin, resolution, and derived review queue | `src/domain/study.ts` |
| Deterministic blueprint-weighted mock selection | `src/domain/mock-exam.ts` |
| Cross-reference validation at content-pack load | `src/domain/content-pack.ts` |
| CCAO-F assessment definitions | `src/content/certifications/claude-associate-foundations/assessments.ts` |
| Reviewed question bank | `src/content/certifications/claude-associate-foundations/question-bank.ts` |
| Practice-set registry entries | `src/content/certifications/claude-associate-foundations/practice-sets.ts` |
| Question resolution and registry lookups | `src/content/index.ts` |
| Content compatibility fingerprint | `src/content/fingerprint.ts` |
| Mock-exam preview definition and allocation | `src/content/mock-exam.ts` |
| Versioned localStorage envelope and failure handling | `src/persistence/storage.ts` |
| External study store and write-blocking rules | `src/persistence/study-store.ts` |
| Bank coverage and personal-performance selectors | `src/features/progress/selectors.ts` |
| Persisted runner wrapper | `src/features/study/components/PersistedAssessment.tsx` |
| Storage recovery notice | `src/features/study/components/StudyStorageNotice.tsx` |
| Practice, review, progress, and mock-exam pages | `src/pages/*.tsx` |
| Reusable runner UI | `src/features/assessment/components/AssessmentRunner.tsx` |
| Immediate lesson knowledge-check UI | `src/features/curriculum/components/KnowledgeCheck.tsx` |
| Runner styles | `src/styles/assessment.css` |
| Study/review/progress styles | `src/styles/study.css` |

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

The Practice page is registry-driven. `practiceSets` validates each entry against the reviewed bank:
every question must resolve to a bank entry, and the declared domains must exactly match the
domains those questions are mapped to. Seven sets exist: one per domain with items plus a mixed set.
`/practice?set=<assessmentId>` is a stable deep link, and an unknown set renders a deliberate
not-found state rather than inventing content.

`PersistedAssessment` wraps the runner. It creates the first session snapshot through
`startStudyAttempt`, resumes an existing in-progress attempt instead of starting a duplicate, and
saves in-progress changes through `saveStudySession`. A submitted attempt is immutable; later review
navigation does not rewrite answers or the submission timestamp.

The Context Window sample assessment remains in the pack and its lesson keeps the immediate
`KnowledgeCheck`; that sample is still explicitly unmapped to an official CCAO-F objective. The
Domain 2 lesson also keeps its own `KnowledgeCheck` and links to reviewed bank items through
`relatedQuestionIds`; both surfaces use the same exact-set scoring function (`isAnswerCorrect`).

## 7a. Local persistence and recovery

The storage key is `cfl.study.v1`, containing a versioned envelope:

```ts
{
  schemaVersion: 1,
  contentFingerprint: "study-v1-…",
  savedAt: "ISO-8601",
  state: { attempts: StudyAttempt[], reviewResolutions: ReviewResolution[] }
}
```

Only attempts and explicit review resolutions are stored. Scores, review-queue membership, and
progress metrics are derived, so they cannot drift from the answers.

`loadStudyStateFromStorage` distinguishes:

| State | Behaviour |
|---|---|
| `empty` | Start with an empty state. |
| `ready` | Validate the envelope and use the saved state. |
| `corrupt` | Preserve the raw payload, block new writes, and offer backup + reset. |
| `incompatible` | Version or content fingerprint mismatch; preserve raw data, block writes. |
| `unavailable` | No storage, blocked reads, or a `SecurityError`; continue in memory with a warning. |

`saveStudyStateToStorage` classifies `QuotaExceededError`, `SecurityError`, invalid state, and
unavailable storage. A failed write keeps the latest state in memory and surfaces the failure; it does
not silently claim success. The app never deletes recoverable data automatically.

The content fingerprint covers assessment definitions, question types/choices/answer keys, bank
mappings, and blueprint weights. Lesson prose and explanations are excluded because they do not affect
scoring. A fingerprint change blocks resume and scoring until the learner downloads the raw backup and
resets, preventing old answers from being scored against a different key.

## 7b. Review queue

`deriveReviewItems` rebuilds the queue from submitted attempts. An item appears when the outcome is
`incorrect` or `unanswered`, or when the learner flagged the question, including a correct-but-flagged
question. Each item keeps its attempt id, assessment id, origin (`practice` set or `mock-exam`
blueprint), submission time, question, score, and reasons.

Opening an item never resolves it. `resolveReviewItem` is an explicit action, idempotent per
`attemptId:questionId`, and only allowed for submitted attempts and questions inside that attempt. The
queue is sorted by submission time and question id, and the Review page exposes reason filters and
previous/next navigation.

## 7c. Progress and mock exam

`deriveProgressSummary` keeps two concerns separate:

- **Bank coverage** from the reviewed registry: total items, format split, objectives covered,
  domains with items, and per-domain item/objective counts.
- **Personal performance** from submitted attempts: attempts, answered/correct/incorrect/unanswered,
  accuracy on answered questions, raw percentage, last submission, and per-domain totals.

A zero-activity learner sees real bank coverage and an explicit empty personal state, not a fake zero
score. The report never claims readiness or an official scaled score.

The mock-exam preview uses the verified 60-item format and selects 60 of the 62 available reviewed
items. `selectMockExamQuestions` allocates slots by published domain weight, caps each domain at its
available pool, deduplicates shared questions, and interleaves the result. Because the bank is larger
than the format, two items are not selected in a given preview; the allocation is deterministic and
adds no filler or duplicate. There is no timer and no scaled-score conversion.

## 8. Deliberate non-goals for C2

- No timer, auto-submit, or expiry.
- No timed 60-question simulation. The bank has 62 reviewed items across all seven domains, and every
  objective has two to four items, but a preview is not a simulation.
- No per-domain official score report or scaled-score conversion.
- No partial credit.
- No official exam questions or third-party exam dumps. Every bank item is original.
- No automatic deletion or migration of unreadable saved data.
- No server, account, analytics, or sync.
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

`src/test/study-domain.test.ts` covers attempt snapshots, in-progress updates, submitted-attempt
immutability and idempotency, exact-set and unanswered scoring through persisted attempts, derived
review reasons (including correct-but-flagged), explicit resolution, and invalid resolutions.

`src/test/storage.test.ts` covers envelope round-trips, empty/unavailable storage, corrupt JSON and
state, schema-version and fingerprint incompatibility, quota/security failures, read failures, and
clearing the key.

`src/test/study-journey.test.tsx` covers the persisted practice journey: start, submit, write the
versioned envelope, restore the submitted result, start a new attempt, derive the review queue, and
resolve an item only on request.

`src/test/mock-exam.test.ts` covers weighted allocation, availability caps, shortfall reporting,
deduplication, determinism, invalid counts, the 60-of-60 preview drawn from 62 items, and the
unit-level zero-availability handling.

`src/test/progress-selectors.test.ts` covers bank coverage independent of activity, personal
performance from a submitted attempt, domain attribution, and review counts.

`src/test/study-pages.test.tsx` covers the mock-exam preview, progress separation, and Settings local
data controls.

`src/test/curriculum.test.ts` covers append-only lesson order, all 30 objectives mapped to published
lessons, resolvable lesson and source references, and the unmapped sample boundary.

`src/test/question-bank.test.ts` covers the 62-entry bank, verified objective mapping, all seven
covered domains and all 30 objectives, at least two items per objective, both question formats,
English-only learner-facing text, Vietnamese explanations for every option, source and verification
references, the Domain 5 set and registry-derived mixed set, unmapped-entry rejection, question-id
uniqueness across lessons and bank, lesson-to-bank reference validation, and
blueprint/certification/objective source validation.

`src/test/domain-2-content.test.tsx` covers the published Domain 2 lesson, six-objective mapping,
reviewed-question links, source/verification references, English/Vietnamese language checks, the
unmapped Context Window boundary, lesson route rendering, and the lesson knowledge-check journey.

`src/test/domain-5-content.test.tsx` covers the Domain 5 lesson and objective mapping, two items per
Domain 5 objective, practice-set wiring, registered sources, language separation, stated selection
counts in multiple-response stems, and exact-set scoring where partial and extra selections both fail.

`src/test/practice-page.test.tsx` covers the practice-set index, the Domain 2 and Domain 5 deep links,
single-domain badges, the compact mixed-set badge, and the unknown-set state.

## 10. Next step

The content depth and mapped-lesson work is complete at the registry level: all 30 objectives have
reviewed items and a mapped lesson, with two to four items per objective. The remaining work is a
separate versioned **timed** layer (timer, expiry, auto-submit) with a defensible scoring policy, not
another preview. It should not be embedded in the existing scoring core. The current store already
separates attempts from derived results, so a timer can add a session status without rewriting saved
answers.

Phase C2.6 adds the browser regression gate (`npm run test:e2e`) and 65 axe scans over both themes.
Phase C2.7 adds a GitHub Actions workflow that runs the same gates on pull requests and pushes to
`main`; its first `main` run passed on 2026-10-28. Firefox/WebKit, cross-browser compatibility, and a
manual screen-reader pass remain outstanding.
