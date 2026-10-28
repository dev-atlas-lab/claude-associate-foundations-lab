# Assessment Engine

**Status:** assessment core, local persistence, registry-driven practice sets, review queue, progress
report, untimed mock-exam preview, and a deadline-enforced timed simulation implemented (Phase C2.8,
2026-10-28). Content coverage was completed in Phase C2.4, extended in Phase C2.5, and browser-tested
in Phases C2.6-C2.8.
**Scope:** deterministic single-choice and multiple-response scoring, 62 reviewed items across all
seven domains, versioned localStorage attempts, derived review queue and progress, a 60-of-60
blueprint-weighted preview, and a 60-question / 120-minute timed attempt with a persisted deadline.
The `/mock-exam` preview has no timer; `/mock-exam/timed` is a timed practice simulation, but neither
surface is an official exam form, an official scaled score, or a pass predictor.

## 1. Where the code lives

| Concern | Module |
|---|---|
| Schemas, policies, sessions, scoring, state transitions | `src/domain/assessment.ts` |
| Question-bank schema and review metadata | `src/domain/question-bank.ts` |
| Persisted attempt, origin, resolution, and derived review queue | `src/domain/study.ts` |
| Deterministic blueprint-weighted mock selection | `src/domain/mock-exam.ts` |
| Timed-attempt schema, deadline, expiry, and immutable submission | `src/domain/timed-exam.ts` |
| Cross-reference validation at content-pack load | `src/domain/content-pack.ts` |
| CCAO-F assessment definitions | `src/content/certifications/claude-associate-foundations/assessments.ts` |
| Reviewed question bank | `src/content/certifications/claude-associate-foundations/question-bank.ts` |
| Practice-set registry entries | `src/content/certifications/claude-associate-foundations/practice-sets.ts` |
| Question resolution and registry lookups | `src/content/index.ts` |
| Content compatibility fingerprint | `src/content/fingerprint.ts` |
| Mock-exam preview definition and allocation | `src/content/mock-exam.ts` |
| Timed-exam configuration, eligibility, and seeded selection | `src/content/timed-exam.ts` |
| Versioned localStorage envelope and failure handling | `src/persistence/storage.ts` |
| Timed-exam envelope (`cfl.timed-exam.v1`) | `src/persistence/timed-exam-storage.ts` |
| Single-slot timed-exam store and write blocking | `src/persistence/timed-exam-store.ts` |
| External study store and write-blocking rules | `src/persistence/study-store.ts` |
| Bank coverage and personal-performance selectors | `src/features/progress/selectors.ts` |
| Persisted runner wrapper | `src/features/study/components/PersistedAssessment.tsx` |
| Storage recovery notice | `src/features/study/components/StudyStorageNotice.tsx` |
| Timed intro, session, timer, navigator, recovery, and result UI | `src/features/timed-exam/` |
| Practice, review, progress, mock-exam, and timed-exam pages | `src/pages/*.tsx` |
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

Only `in-progress` and `submitted` are modelled in the shared assessment core. `expired` is still
deliberately absent from this core: the timed layer does not add an unreachable session state.
Instead, `src/domain/timed-exam.ts` wraps the session, adds an authoritative `deadlineAt`, and records
`submissionReason: "user" | "time-expired"` when it submits. An expired attempt is therefore a normal
submitted session with an explicit reason, and the result remains the same derived object used by
Practice.

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

The untimed mock-exam preview at `/mock-exam` uses the verified 60-item format and selects 60 of the
62 available reviewed items. `selectMockExamQuestions` allocates slots by published domain weight,
caps each domain at its available pool, deduplicates shared questions, and interleaves the result.
Because the bank is larger than the format, two items are not selected in a given preview; the
allocation is deterministic and adds no filler or duplicate. The preview has no timer and no
scaled-score conversion. The separate `/mock-exam/timed` route adds the deadline layer described
below.

## 7d. Timed mock exam

### Composition, not a second scoring engine

`src/domain/timed-exam.ts` wraps an `AssessmentSession` with the attempt snapshot and deadline. It
composes `chooseAnswer`, `toggleAnswerChoice`, `goToQuestion`, `toggleQuestionFlag`,
`submitAssessment`, and `calculateAssessmentResult` from the shared core. Exact-set multiple-response
scoring, all-or-nothing credit, unanswered versus incorrect reporting, and raw percentage therefore
come from the same functions as Practice and the preview.

The persisted attempt adds:

```ts
interface TimedExamSession {
  schemaVersion: 1;
  id: string;
  assessmentId: string;
  blueprintId: string;
  questionIds: string[];          // immutable attempt order, snapshotted at start
  policy: AssessmentPolicy;
  durationMinutes: number;
  deadlineAt: string;             // authoritative, ISO-8601 UTC
  session: AssessmentSession;
  submissionReason?: "user" | "time-expired";
  finalResult?: AssessmentResult; // written once at submission
}
```

Runtime validation enforces the important invariants: IDs match, the question list has no
duplicates, answers and flags reference only attempt questions, `currentQuestionIndex` is in range,
`deadlineAt` equals `startedAt + durationMinutes`, submitted attempts have a reason and a retained
result, and the retained result matches the submitted answers and question order. An in-progress
attempt cannot carry a result or a reason.

### Selection and eligibility

`src/content/timed-exam.ts` reads the 60-item count and 120-minute limit from the verified blueprint
instead of duplicating constants. It reuses the reviewed bank and the allocation logic in
`src/domain/mock-exam.ts`, capping each domain at its available pool. The attempt id seeds the
selection, so reloading a persisted attempt reproduces the same 60 questions and order, while a new
attempt gets another deterministic selection. Current availability is 60 selected from 62 reviewed
items with a shortfall of zero.

If availability ever falls below the requested count, the intro disables **Start timed exam** and
states the exact shortfall. The runner also refuses to start if the selected list is short. No
question is duplicated, padded, or invented to fill the form.

The eligibility check is computed independently of the attempt seed. The seed only chooses which
eligible items fill the weighted slots.

### Deadline and submission guarantees

- `deadlineAt` is the only source of truth. The UI renders once per second from the wall clock and
  recomputes `deadlineAt - now`; there is no decrementing counter that background-tab throttling can
  stretch or reset.
- The timer also re-reads the clock on `visibilitychange`, `focus`, and `pageshow`. The interval is
  a display refresh, not the authority.
- Reloading restores the same attempt and its original deadline. Leaving the page does not pause the
  countdown. The UI effect on mount submits immediately if the stored deadline has passed.
- At expiry, `expireTimedExam` submits with `submittedAt = deadlineAt`, so repeated expiry events,
  re-renders, or a late tab wake-up produce the same immutable timestamp and result.
- A manual submission at or after the deadline is classified as `time-expired`; the deadline wins
  over a late click. Any answer, flag, or navigation mutation that arrives after expiry is discarded
  and triggers the expiry submission instead.
- Submission is idempotent. A submitted attempt is never re-scored, re-ordered, or edited by review
  navigation; the result view keeps its own UI index.
- The UI distinguishes **Manual submission** from **Automatic expiry** in text, and the result view
  shows the raw percentage only. There is no scaled 100-1,000 score, pass threshold, or readiness
  claim.

### Persistence and recovery

The timed feature uses a separate single-slot store at `cfl.timed-exam.v1`, with its own versioned
envelope and fingerprint. It deliberately does not share `cfl.study.v1`:

- timed-exam schema or fingerprint changes cannot invalidate Practice attempts and review state;
- the timed lifecycle is one active attempt, not an attempt history;
- no migration of existing study data is required.

`timedExamContentFingerprint` starts from the shared content fingerprint and adds the timed
configuration (`timed-exam-v1`, item count, duration, assessment id).

The store handles these states without deleting anything automatically:

| State | Behavior |
|---|---|
| `empty` | Show the intro and start controls. |
| `ready` | Resume the exact in-progress attempt, or show the retained submitted result. |
| `corrupt` | Quarantine the payload, offer the raw JSON backup, and require an explicit two-step discard. New attempts are blocked. |
| `incompatible` | Show the stored schema/fingerprint, offer backup, and require explicit discard. New attempts are blocked. Missing questions or changed answer keys after load also produce this state. |
| `unavailable` | Continue in memory in the current tab, with a visible warning that reload will lose the attempt. |
| write failure | Keep the change in memory, show the quota/security message, and do not claim it was saved. |

Discarding removes only `cfl.timed-exam.v1`. `cfl.study.v1` and its practice attempts, review items,
and settings are untouched. Recovery controls use visible text, a two-step confirmation, and focus
management; status is never conveyed by color alone.

### Accessibility and responsive behavior

- Semantics: a labelled timer (`role="timer"`, `aria-live="off"`), a separate polite status region,
  fieldset/legend question groups, labelled answer controls, and a captioned navigator.
- Warnings are announced only when crossing the 10-minute, 5-minute, and 1-minute buckets. The clock
  itself updates silently; the timer warning text is not repeated every second.
- Keyboard operation covers answers, flags, previous/next, the question navigator, submit
  confirmation, recovery, and result review. Focus moves to the question heading on navigation and
  to confirmation headings when they open.
- The timer state uses text (`Time is running low`, `Time is up`) as well as color. Critical and
  expired states meet contrast requirements in both themes.
- Layouts are verified at 390, 768, and 1440 px. The navigator moves below the question on narrower
  screens; the timer and question text remain usable without horizontal overflow.
- Reduced-motion users get no smooth scrolling or long transitions.

Known limitations: the deadline uses the device clock because there is no backend; changing the
system clock can affect the remaining time. A long-suspended or closed browser submits when it next
runs the app, not while it is closed. Local storage is per browser/profile and can be cleared by the
user or browser policy. The raw percentage is not comparable to the official scaled score.

## 8. Deliberate non-goals for C2

- No scaled-score conversion, pass/fail prediction, or claim that raw performance maps to the
  official 720 passing score.
- No per-domain official score report.
- No partial credit; multiple-response questions require the exact set.
- No official exam questions, third-party exam dumps, or claims that practice items are official.
  Every bank item is original.
- No automatic deletion, migration, or rewriting of unreadable saved data.
- No server, account, analytics, cloud clock, or sync in the frontend-only MVP.
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

`src/test/timed-exam.test.ts` covers timed-session creation and invariants, deadline arithmetic,
expiry idempotency, late manual submission classification, answer/flag/navigation rejection after
expiry, immutable retained results, and raw/count derivation.

`src/test/timed-exam-content.test.ts` covers the 60/120 blueprint configuration, zero shortfall,
seeded deterministic selection and order, reload stability, fingerprint separation from study data,
and resolution failures for missing questions.

`src/test/timed-exam-storage.test.ts` covers envelope round-trips, version and fingerprint
incompatibility, corrupt JSON/schema rejection, unavailable storage, quota/security write failures,
and clearing only the timed key.

`src/test/timed-exam-page.test.tsx` covers the start screen and shortfall gate, start/save/resume,
deadline expiry, manual and automatic result labels, review navigation without mutating the saved
attempt, and corrupt/incompatible/unavailable recovery states.

`tests/e2e/timed-exam.spec.ts` covers the preview-to-timed route distinction, reload with the original
deadline, clock-controlled auto-submit, immutable result/review, corrupt and unsupported data,
backup/download and explicit discard, blocked storage, quota write failure, keyboard operation, and
warning announcement throttling. The accessibility suite scans the timed intro, question, and result
states in both themes, and the responsive suite exercises 390/768/1440 px.

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

The shared core, the untimed preview, and the timed simulation are complete for the current bank.
Timed selection is versioned and deterministic, the deadline is persisted and enforced, and results
are immutable. The next content step is depth, not another assessment surface: add only distinct,
source-grounded decisions in high-weight domains, then re-check eligibility and allocation.

Phase C2.6 added the browser regression gate (`npm run test:e2e`) and axe scans over both themes.
Phase C2.7 added a GitHub Actions workflow that runs the same gates on pull requests and pushes to
`main`; its first `main` run passed on 2026-10-28. Phase C2.8 added the timed layer and its
clock-controlled, storage-failure, keyboard, axe, and responsive coverage. Firefox/WebKit, a manual
screen-reader pass, device-clock tampering, and Vercel deployment remain outstanding.
