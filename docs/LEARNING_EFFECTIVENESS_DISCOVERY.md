# Learning Effectiveness Discovery — Phase C2.10

**Date:** 2026-10-28  
**Phase:** C2.10 (Discovery and planning only — no application code modified)  
**Baseline commit:** `d5f8acd` (`test(e2e): derive Domain 7 review and raw percentage counts from registry`)  
**Blueprint:** CCAO-F Exam Guide v1.0, effective July 2026 (pre-2026-11-14 attempt window)

---

## 1. Executive Summary

`claude-associate-foundations-lab` has a solid, strictly validated assessment and content foundation: 7 exam-mapped Vietnamese curriculum lessons, 1 unmapped design sample, 62 reviewed bank items across all 7 domains and 30 official objectives, 8 registry-driven practice sets, an untimed 60-item blueprint preview (`/mock-exam`), a deadline-enforced 60-item / 120-minute timed simulation (`/mock-exam/timed`), a derived mistake/flag review queue (`/review`), and a local progress dashboard (`/progress`).

However, inspecting the actual implementation reveals **five concrete learning-effectiveness gaps** between data the browser already records and what the learner can see or act on:

1. **Timed mock exam results are isolated from study insights and lacks a domain breakdown:** Submitting `/mock-exam/timed` stores the session only in `cfl.timed-exam.v1`. Unlike `/practice` and `/mock-exam`, a submitted timed exam **does not** show a per-domain score breakdown on its result screen, **does not** feed incorrect/unanswered/flagged questions into `/review`, and **is invisible** on `/progress`. Furthermore, starting a new timed exam requires discarding the previous one, permanently erasing the result.
2. **No objective-level visibility or lesson remediation links in results, review, or progress:** Every `QuestionBankEntry` is mapped to a verified `objectiveId`, and every `objectiveId` maps to a published curriculum lesson. Yet `ProgressPage`, `ReviewPage`, `AssessmentRunner`, and `TimedExamResultView` never display which of the 30 official objectives a question tests, never aggregate performance by objective, and never link a missed question or weak domain back to its corresponding `/learn/:lessonId` module or `/practice?set=...` set.
3. **Lesson-to-practice deep links lose domain context:** In `LessonContent.tsx`, the "Mở bộ Domain X practice" call-to-action links to `/practice` (the index) rather than `/practice?set=domain-X-...`, forcing an extra lookup step right after finishing a lesson.
4. **Attempt history is stored in `cfl.study.v1` but hidden from the learner:** `StudyState.attempts` retains every submitted practice and untimed mock attempt in order, but `ProgressPage` collapses them into a single lifetime aggregate (`submittedAttempts`, cumulative `correctAnswers`, and `lastSubmittedAt`). Learners cannot see their recent attempts, compare their first vs. latest run on a practice set, or distinguish first-pass accuracy from repeated-item accuracy.
5. **Practice sets run in a fixed order and lack a way to practice open review items:** Every run of a practice set (`AssessmentRunner`) iterates through `definition.questionIds` in static authored order, and there is no way to run a short, focused practice session drawn from unresolved mistakes or unpracticed/missed objectives without repeating an entire 8–14 item domain set or 62-item mixed set.

This report evaluates these gaps against the 62-item bank's statistical limits, ranks candidate improvements, and recommends a tight, zero-backend, zero-schema-breakage scope for **Phase C2.10**.

---

## 2. Verified Current-State Findings

### 2.1 Content & Question Bank Inventory

Verified from `src/content/index.ts`, `src/content/certifications/claude-associate-foundations/question-bank.ts`, `docs/CONTENT_COVERAGE_MATRIX.md`, and `docs/CONTENT_AUDIT_2026-10-28.md`:

| Domain | Official Weight | Objectives | Mapped Lesson | Bank Items (Single / Multi) | Items per Objective | Timed Mock Allocation |
|---|---:|---:|---|---:|---|---:|
| **D1:** Prompting and Task Execution | 14% | 4 | `prompt-structure` | 8 (4 / 4) | 2 per objective | 8 |
| **D2:** Output Evaluation and Validation | 21% | 6 | `evaluation-basics` | 14 (8 / 6) | 2 on 5 objectives; **4** on `output-identify-hallucinations` | 13 |
| **D3:** Product and Model Selection | 12% | 4 | `product-selection` | 8 (4 / 4) | 2 per objective | 8 (absorbs +1 from D6 cap) |
| **D4:** Workflow Integration and Solution Design | 16% | 5 | `workflow-design` | 10 (5 / 5) | 2 per objective | 10 |
| **D5:** Configuration and Knowledge Management | 12% | 4 | `configuration-basics` | 8 (4 / 4) | 2 per objective | 7 |
| **D6:** Governance, Risk, and Responsible Use | 15% | 4 | `governance-responsible-use` | 8 (4 / 4) | 2 per objective | 8 (capped by pool size) |
| **D7:** Troubleshooting and Optimization | 10% | 3 | `troubleshooting-optimization` | 6 (3 / 3) | 2 per objective | 6 |
| **Total (Reviewed Bank)** | **100%** | **30** | **7 mapped (+1 sample)** | **62 (32 / 30)** | **Min 2, Max 4** | **60 / 60** |

### 2.2 Capability Matrix: What Exists vs. Limitations

| Area | What Already Exists (Verified in Code) | Verified Limitations |
|---|---|---|
| **Results by domain & objective** | `deriveProgressSummary` (`src/features/progress/selectors.ts:77-249`) computes cumulative domain-level `attemptedQuestions`, `correctAnswers`, `incorrectAnswers`, `unansweredQuestions`, and `accuracyOnAnswered` across submitted `cfl.study.v1` attempts, rendered on `ProgressPage.tsx:168-198`. | • **No objective-level aggregation** anywhere in selectors or UI.<br>• **No per-domain breakdown on individual attempt result views** (`AssessmentRunner.tsx:301-343` and `TimedExamResultView.tsx:108-177` show only top-level totals).<br>• Timed exam results (`cfl.timed-exam.v1`) are excluded from `deriveProgressSummary`. |
| **Incorrect-answer review** | `deriveReviewItems` (`src/domain/study.ts:342-409`) builds a queue from submitted `cfl.study.v1` attempts for `incorrect`, `unanswered`, and `flagged` items (including `correct` + `flagged`). `ReviewPage.tsx` provides reason filters (`all`, `incorrect`, `unanswered`, `flagged`), Vietnamese explanations for every option, and explicit idempotent resolution (`resolveReviewItem`). | • **Timed exam mistakes/flags never enter `/review`** because `deriveReviewItems` reads only `StudyState.attempts` (`cfl.study.v1`).<br>• **No domain or objective context on `ReviewPage.tsx`**: items show only origin title, timestamp, and question type (`ReviewPage.tsx:352-356`).<br>• **No source links or lesson remediation links** on `ReviewPage.tsx` or `AssessmentRunner.tsx` (unlike `QuestionPanel.tsx:224-240` in timed review, which renders `sources`).<br>• If a learner misses the same question across 3 attempts, it appears 3 times in `/review` with no indication that it is a repeat miss. |
| **Repeated practice & session selection** | `PracticePage.tsx` lists 8 registry sets (7 domain sets + `mixed-foundations-set`), supports `?set=` deep links, resumes active in-progress attempts, and shows the latest submitted attempt with a `New attempt` button (`PracticePage.tsx:45-51`). | • Question order in `AssessmentRunner` is **always static** (`definition.questionIds` order).<br>• Starting a `New attempt` re-runs the exact same fixed sequence.<br>• Learners cannot launch a targeted session of **unresolved review items** or **unpracticed/missed questions**.<br>• `PracticePage` index rows (`PracticePage.tsx:178-199`) do not show whether the learner has an in-progress attempt or their latest score on each set.<br>• `LessonContent.tsx:187` links to `/practice` instead of `/practice?set=<domainSetId>`. |
| **Progress persistence & history** | `cfl.study.v1` (`src/persistence/storage.ts`) stores `attempts: StudyAttempt[]` and `reviewResolutions: ReviewResolution[]`, guarded by `contentFingerprint` (`src/content/fingerprint.ts`). Every submitted practice and untimed preview attempt is appended and retained in `state.attempts`. `SettingsPage.tsx` offers JSON backup download and two-step reset. | • **Attempt history is invisible in the UI:** `ProgressPage.tsx` aggregates all attempts into a single sum. If a learner scores 4/8 on Domain 1 and later 8/8 on Domain 1, `ProgressPage` only reports `16 attempted, 12 correct (75%)` — hiding the improvement.<br>• **`cfl.timed-exam.v1` is single-slot (`src/persistence/timed-exam-store.ts:14-19`):** Starting a new timed exam requires calling `discardTimedExam()`, which permanently deletes the previous timed exam result unless it was also recorded in study history. |
| **Weakness identification** | Learners can manually scan the 7-row domain table on `ProgressPage.tsx:168-198` to spot lower `Accuracy` percentages. | • **No objective-level breakdown** (30 objectives).<br>• **No distinction between "untested" and "weak" objectives.**<br>• **No actionable remediation links** (e.g., from a weak domain/objective directly to its lesson `/learn/:id` or practice set `/practice?set=:id`). |
| **Objective coverage & confidence** | `ProgressPage.tsx:56-124` cleanly separates **Bank coverage** (content inventory: 62 items, 30/30 objectives) from **Your performance**. | • **Personal coverage of the bank is not shown:** A learner who submits one 6-item set thirty times sees `Submitted attempts: 30, Answered: 180`, without seeing that they have only ever touched **6 of 62 unique bank items** (3 of 30 objectives). |
| **Timed vs. untimed assessment results** | `/mock-exam` persists to `cfl.study.v1` with `origin: { kind: "mock-exam", blueprintId }`. `/mock-exam/timed` persists to `cfl.timed-exam.v1` with wall-clock `deadlineAt`, reload recovery, and `submissionReason: "user" \| "time-expired"`. Both enforce exact-set all-or-nothing scoring and raw percentage disclaimers. | • `/mock-exam` (untimed) flows into `/progress` and `/review`, whereas `/mock-exam/timed` (the realistic simulation) **does not**.<br>• Neither `/mock-exam` nor `/mock-exam/timed` displays a **per-domain breakdown table** on the post-submission result screen, even though the official CCAO-F exam report provides percent-correct by domain (`docs/EXAM_BLUEPRINT.md` §3). |

---

## 3. Product Questions — Evidence-Based Evaluation

### Q1. Weakness analysis: Can learners identify weak domains and objectives from available results?
- **Domains:** **Partially.** On `/progress`, learners can see cumulative domain accuracy across untimed attempts, and on individual attempt results they see only an overall score (not a per-domain breakdown). Timed mock exams show no domain breakdown at all.
- **Objectives:** **No.** Although every bank item maps to a verified objective in `questionBankEntries` (`src/content/index.ts:91`), objective mappings are never joined to `QuestionScore` or `ReviewItem` in the UI. A learner who scores 50% in Domain 2 (14 items across 6 objectives) cannot see whether they failed `output-identify-hallucinations` or `output-format-selection` without manually cross-referencing question IDs in source code.

### Q2. Targeted practice: Can learners practise relevant questions without excessive repetition?
- **By Domain:** **Yes.** The 7 domain practice sets (`PracticePage.tsx`) isolate each domain cleanly (6 to 14 items per set).
- **Avoiding repetition / targeting weaknesses:** **Limited.**
  1. Domain practice sets always present items in the exact same order (`definition.questionIds`), encouraging positional memorization on repeat runs.
  2. There is no way to practice **only current open review items** or **unseen questions** across the bank.
  3. Because 29 of 30 objectives have only **2 items**, objective-specific practice sets would be 2-question micro-quizzes that immediately repeat. Therefore, **domain-level sets** and a **dynamic "Open Review Queue" / "Unseen & Needs Review" practice mode** are much better suited to the 62-item bank than 30 tiny objective sets.

### Q3. Learning from mistakes: Can learners review incorrect answers with useful explanations and context?
- **Explanations:** **Yes, strong.** Every bank question has a Vietnamese `correctExplanation` and per-choice Vietnamese `explanation` (`AssessmentRunner.tsx:444-457`, `ReviewPage.tsx:221-235`, `QuestionPanel.tsx:203-219`).
- **Missing Context & Remediation:**
  1. In `ReviewPage.tsx` and `AssessmentRunner.tsx`, a learner reviewing an incorrect question is **not shown**:
     - Which **Domain** and **Official Objective** the question maps to.
     - Which **Curriculum Lesson** (`/learn/:lessonId`) teaches that concept.
     - The **Official Sources** (`question.sourceIds`) backing the answer (currently shown only in `TimedExamResultView` via `QuestionPanel.tsx:224-240`, omitted in `ReviewPage.tsx` and `AssessmentRunner.tsx`).
  2. Mistakes from `/mock-exam/timed` never appear in `/review`.

### Q4. Progress over time: Is there enough retained data to compare attempts meaningfully?
- **In `cfl.study.v1`:** **Yes!** Every submitted practice set and untimed mock preview is already retained in `state.attempts` with `startedAt`, `submittedAt`, `questionIds`, `answers`, `flaggedQuestionIds`, and `origin` (`src/domain/study.ts:43-49`). No schema change is required to show:
  - Per-practice-set status on `/practice` (e.g., "In progress", "Last attempt: 87.5% · 2 attempts").
  - An **Attempt History** list on `/progress` (showing date, assessment title, raw percentage, correct/total, and improvement vs. previous attempt on the same set).
  - **Unique bank coverage** (how many of the 62 reviewed items the learner has answered at least once, and how many were answered correctly on the **most recent** encounter vs. lifetime cumulative count).
- **In `cfl.timed-exam.v1`:** **Currently single-slot.** When a timed exam is submitted, it sits in `cfl.timed-exam.v1` until discarded. If we either record a completed timed exam into `cfl.study.v1` (via a new `origin` variant or a pure selector/sync on submission) **or** read the submitted `cfl.timed-exam.v1` session in Progress/Review selectors, the learner immediately gets domain breakdowns and review items—though keeping history across multiple timed exams requires either appending submitted timed attempts to `cfl.study.v1` or storing a bounded history array. *(See Section 7 for the architectural trade-off.)*

### Q5. Readiness indicators: Can the app communicate progress without making unsupported predictions about passing the real exam?
- **Yes, through transparent, evidence-based coverage metrics rather than pass/fail predictions.**
- We must **never** convert raw percentages to the 100–1,000 scale, apply a 720 cut score, or label a learner "Exam Ready."
- Instead, the app can report **Study Coverage & Evidence Indicators** grounded strictly in local facts:
  1. **Unique Bank Exposure:** e.g., `42 / 62 reviewed items practiced` (`24 / 30 objectives touched`).
  2. **Latest Outcome by Objective/Domain:** Based on the learner's *most recent* submitted answer to each unique question (`Correct on latest`, `Incorrect/Unanswered on latest`, `Not yet practiced`).
  3. **Open Review Debt:** Number of unresolved items in `/review`.
  4. **Repetition Caveat:** When a learner has attempted the same question multiple times, explicitly display both **Latest attempt accuracy** and **First-seen accuracy** (derivable from the chronologically first submitted attempt containing each `questionId`!), reminding the learner that high scores on repeated items reflect familiarity with the 62-item bank, not guaranteed performance on unseen official exam items.

### Q6. Content sufficiency: Does the current question-bank depth support each proposed metric?
**Critical constraint (`docs/CONTENT_AUDIT_2026-10-28.md`):**
- Total reviewed bank: **62 items** across **30 objectives**.
- **29 of 30 objectives have exactly 2 items** (1 single-choice, 1 multiple-response).
- **1 objective (`output-identify-hallucinations` in Domain 2) has 4 items.**
- Domain item counts are **8 / 14 / 8 / 10 / 8 / 8 / 6**.
- Full-length mock exams (`60 items`) draw **60 of the 62** items (**96.8% of the entire bank**).

**Implications for metrics and features:**
1. **No percentage scores at the single-objective level without raw counts:** With 2 items per objective, possible percentages on a single pass are only `0%`, `50%`, or `100%`. Showing `50%` or a confidence bar for an objective is statistically noisy. Objective-level views **must** prioritize raw counts (e.g., `1 / 2 items correct on latest attempt`, or `0 / 2 practiced`) and qualitative status labels (`Not practiced`, `Needs review (0/2 or 1/2)`, `All available items correct (2/2 — limited bank depth)`).
2. **Full mock exams overlap by 58–60 items with each other and with Domain Practice Sets:** Taking a second 60-item mock exam tests almost the exact same items as the first. Therefore:
   - Mock exam results and `/progress` must state how many items in an attempt were **previously seen** in earlier submitted attempts.
   - First-seen accuracy vs. repeat accuracy is essential so learners do not mistake memorized answers on a 2nd mock exam for genuine exam readiness.

### Q7. Privacy and persistence: Can improvements use the current local storage and data model without introducing unnecessary backend infrastructure?
- **100% local, zero backend.**
- Nearly all high-value improvements can be derived **purely at read time** from the existing `cfl.study.v1` (`StudyState`) and `cfl.timed-exam.v1` (`TimedExamSession`) payloads plus the static `contentPack` registry (`questionBankEntries`, `publishedLessons`, `primaryBlueprint`).
- **Schema compatibility:**
  - `cfl.study.v1` (`STUDY_SCHEMA_VERSION = 1`) and `contentFingerprint` **do not need to change** if we derive objective breakdowns, first-seen vs. latest accuracy, attempt history, lesson remediation links, and per-domain result tables from existing `StudyAttempt[]` + `TimedExamSession`.
  - Existing saved learner data in `localStorage` remains 100% valid without triggering the `incompatible` quarantine state.

---

## 4. User Problems Demonstrably Unsolved Today

| ID | Unsolved Learner Problem | Evidence in Current Codebase |
|---|---|---|
| **P1** | *"I just finished a 60-question timed mock exam (or domain practice set), and I only see a single overall score (`rawPercentage`). Which domains or objectives hurt my score?"* | `TimedExamResultView.tsx:108-177` and `AssessmentRunner.tsx:301-343` render only overall counts (`total`, `answered`, `correct`, `incorrect`, `unanswered`, `rawPercentage`). Neither computes or renders a domain or objective breakdown for that attempt. |
| **P2** | *"When I get a question wrong in Practice, Review, or Mock Exam, I don't know which exam objective it belongs to or which lesson to read to fix my mental model."* | `AssessmentRunner.tsx:423-459` and `ReviewPage.tsx:171-268` render only `question.stem`, `choices`, and `correctExplanation`. Neither looks up `getQuestionBankEntry(question.id)` to show the domain, objective statement, `question.sourceIds`, or the mapped lesson link (`/learn/:lessonId`). |
| **P3** | *"I completed a 120-minute Timed Mock Exam, but none of my wrong or flagged answers appeared in `/review`, and `/progress` acts as if I haven't taken it."* | `TimedExamPage.tsx` writes only to `cfl.timed-exam.v1`. `deriveReviewItems` (`src/domain/study.ts:342`) and `deriveProgressSummary` (`src/features/progress/selectors.ts:77`) read only `StudyState` from `cfl.study.v1`. |
| **P4** | *"On `/progress`, my early mistakes drag down my cumulative domain accuracy forever, and I can't see my attempt history or tell how many of the 62 unique bank questions I've actually covered."* | `deriveProgressSummary` (`src/features/progress/selectors.ts:160-205`) sums all attempts together without exposing an attempt history list, unique items seen (`X / 62`), or latest-attempt vs. first-seen performance. |
| **P5** | *"When I finish reading a domain lesson and click 'Mở bộ Domain X practice', it drops me on the generic `/practice` list instead of opening that domain's practice set."* | `LessonPage.tsx:64-88` computes `practiceDomainLabel`, and `LessonContent.tsx:187` hardcodes `<Link className="inline-link" to="/practice">` instead of linking to `/practice?set=<domainPracticeSetId>`. |
| **P6** | *"On `/practice`, I can't tell which sets I have already completed, which one has an open in-progress session, or what I scored last time."* | `PracticePage.tsx:178-199` maps over `practiceSets` using only static registry metadata; `snapshot.state` is not queried for the index cards. |

---

## 5. Candidate Improvements — Ranked Evaluation

Candidates are ranked by **Learner Value**, **Implementation Cost**, **Risk**, and **Dependencies**.

| Rank | Candidate Improvement | Addresses | Learner Value | Impl. Cost | Risk | Schema / Fingerprint Impact |
|---:|---|---|---|---|---|---|
| **1** | **Per-Attempt Domain Breakdown & Remediation Links on All Result Screens** (`AssessmentRunner` + `TimedExamResultView`) | P1, P2 | **Very High** — Immediately aligns mock/practice results with CCAO-F's domain-level reporting and links weak domains directly to their mapped lesson and domain practice set. | **Low** | **Low** — Pure selector over `AssessmentResult` + `questionBankEntries` + `primaryBlueprint`. | **None** |
| **2** | **Question Context & Lesson Remediation in Review, Practice, and Timed Review** (Show Domain, Objective, Sources, and "Review Lesson" link on every reviewed question) | P2 | **Very High** — Closes the loop between making a mistake and re-learning the underlying Vietnamese lesson concept. | **Low** | **Low** — Read-only metadata lookup via `getQuestionBankEntry`, `getObjective`, `publishedLessons`, and `getSources`. | **None** |
| **3** | **Objective-Level Coverage, Latest vs. First-Seen Accuracy, and Attempt History on `/progress`** | P1, P4 | **High** — Lets learners see all 30 objectives (with honest `X / 2 items` depth labels), separates unique bank coverage (`X / 62 seen`) and first-seen accuracy from repeated-attempt inflation, and shows chronological attempt history. | **Medium** | **Low** — Pure derivation in `src/features/progress/selectors.ts` and UI sections on `ProgressPage.tsx`. | **None** |
| **4** | **Practice Hub Status Badges & Direct Lesson-to-Set Deep Links** (`PracticePage` + `LessonPage`/`LessonContent`) | P5, P6 | **High** — Fixes the broken lesson-to-practice flow (`/practice?set=...`) and shows "In progress", "Attempted (Last: X%)", or "Not started" on `/practice` rows. | **Very Low** | **Very Low** — Uses existing `findActiveAttempt` and `findLatestSubmittedAttempt`. | **None** |
| **5** | **Include Submitted Timed Exam in `/progress` and `/review` (Read-Time Integration)** | P3 | **High** — Ensures the learner's 60-question timed simulation counts toward `/progress` insights and surfaces its missed/flagged items in `/review` without merging storage keys or risking `cfl.study.v1` corruption. | **Medium** | **Low–Med** — Must keep `cfl.study.v1` and `cfl.timed-exam.v1` storage envelopes independent as designed in C2.8; resolving a timed-exam item in `/review` requires either allowing `reviewResolutions` to reference a timed session ID or displaying timed review items as a dedicated section/filter. | **None** (if read-time) |
| **6** | **Focused "Practice Open Review Items" Mode (or Deterministic Question Shuffling)** | Q2 | **Medium** — Lets learners re-test their unresolved `/review` mistakes in an interactive runner, or shuffle a domain set on `New attempt`. | **Medium–High** | **Medium** — `studyAttemptSchema` validates `origin` (`practice` requires `practiceSetId === session.assessmentId`), and `contentFingerprint` hashes registered assessments. Adding ad-hoc dynamic assessment IDs into `cfl.study.v1` would require schema/origin changes or running review-practice in memory. | **Medium** (if persisted) / **None** (if in-memory) |
| **7** | **Multi-Attempt Timed Exam History Archive** | Q4 | **Low–Med** — With 62 bank items, a learner rarely takes more than 1–2 timed 60-item exams before exhausting unseen items. | **Medium** | **Medium** — Changing `cfl.timed-exam.v1` from single-slot to multi-slot breaks `TIMED_EXAM_SESSION_VERSION = 1` compatibility. | **High** (breaks `cfl.timed-exam.v1` schema) |

---

## 6. Recommended Minimum Scope for Phase C2.10

To maximize learner value while keeping risk near zero and **preserving 100% compatibility with existing `cfl.study.v1` and `cfl.timed-exam.v1` schemas and fingerprints**, Phase C2.10 should implement **Candidates 1 through 5 (read-time integration)** and explicitly defer Candidates 6 and 7.

### Recommended C2.10 Deliverables

#### 1. Shared Attempt Breakdown & Remediation Selector (`src/features/progress/attempt-breakdown.ts` or `selectors.ts`)
- Given any `AssessmentResult` (from Practice, Mock Preview, or Timed Mock Exam), derive:
  - **Per-domain breakdown** for the attempt: `domainId`, `code`, `title`, `weightPercent`, `totalQuestions`, `correctAnswers`, `incorrectAnswers`, `unansweredQuestions`, `rawPercentage`, mapped `lessonId` (`/learn/:lessonId`), and mapped domain `practiceSetId` (`/practice?set=:practiceSetId`).
  - **Question-level enrichment helper**: Given a `questionId`, return its `Domain`, `Objective`, mapped curriculum `Lesson` (`id`, `title`), domain `PracticeSetSummary`, and resolved `Source[]`.

#### 2. Post-Submission Domain Breakdown & Actionable Next Steps (`AssessmentRunner.tsx` & `TimedExamResultView.tsx`)
- When an attempt is submitted:
  - Render a **Domain Breakdown** table on `TimedExamResultView` and on multi-domain `AssessmentRunner` results (such as `/mock-exam` and `mixed-foundations-set`), and an **Objective Breakdown** table on single-domain practice sets (showing exact counts like `1/2 correct`, objective statement, and status).
  - For any domain or objective with incorrect/unanswered items, provide direct links to:
    - The mapped curriculum lesson (`/learn/:lessonId`).
    - The domain practice set (`/practice?set=:practiceSetId`).
- In `AssessmentRunner.tsx` post-submission question review, match `TimedExamResultView` by displaying the question's **Domain & Objective badge**, **Lesson link**, and **Sources (`Nguồn tham chiếu`)**.

#### 3. Enriched Mistake Review (`ReviewPage.tsx`)
- On both the `/review` queue list and the `/review?item=...` detail card:
  - Display the question's **Domain code/title** and **Official Objective statement**.
  - On the detail card, render the question's **Official Sources (`Nguồn tham chiếu`)** and direct remediation links: **"Ôn lại bài học: [Lesson Title]"** (`/learn/:lessonId`) and **"Luyện tập Domain [X]"** (`/practice?set=:id`).
  - Show a **repeat-miss indicator** if the same `questionId` has more than one open review item across attempts (or has been missed multiple times), so learners spot stubborn misconceptions immediately.
- Surface **Submitted Timed Exam review items** (incorrect, unanswered, flagged from `cfl.timed-exam.v1` when a submitted session exists) on `/review` in a clearly labelled section or integrated view with a link to `/mock-exam/timed`, without mutating `cfl.study.v1`'s `resolveReviewItem` invariant (which requires `attemptId` to exist in `StudyState.attempts`).

#### 4. Actionable Progress, Objective Matrix, Bank Exposure & Attempt History (`ProgressPage.tsx` & `selectors.ts`)
- Upgrade `deriveProgressSummary` and `ProgressPage.tsx` to answer four learner questions transparently:
  1. **Unique Bank Exposure & First-Seen vs. Latest Accuracy:**
     - Report `Unique items practiced: X / 62` (`Y / 30 objectives touched`).
     - Report **First-seen accuracy** (accuracy on the chronologically first submitted attempt in which each unique question was answered) alongside **Latest accuracy** (outcome on the most recent submitted attempt for each unique question) and **Cumulative accuracy**.
     - Explain clearly in a Callout why First-seen vs. Latest matters in a 62-item bank (repeating questions inflates cumulative/latest scores).
  2. **Domain Performance with Remediation Links & Priority Sorting:**
     - Add `Unique items seen (X / Y)`, `Latest accuracy`, and direct links to the domain's **Lesson** (`/learn/:id`) and **Practice Set** (`/practice?set=:id`) in the Domain Performance table.
  3. **Objective-Level Checklist (All 30 Objectives Grouped by Domain):**
     - Show each official objective with its bank depth (`2 items` or `4 items`), how many unique items the learner has practiced (`0/2`, `1/2`, `2/2`), and how many were correct on the latest attempt (`0/2`, `1/2`, `2/2`).
     - Use transparent, non-predictive status labels (`Not practiced`, `Needs review`, `All bank items correct (2/2)` — never "Mastered" or "Exam ready").
  4. **Submitted Attempt History Table:**
     - List submitted attempts from `cfl.study.v1` (most recent first) plus the current submitted timed exam from `cfl.timed-exam.v1` (if present), showing assessment title, type (`Practice`, `Untimed preview`, `Timed simulation`), submission timestamp, `correct / total`, `rawPercentage`, and `unanswered` count.

#### 5. Lesson-to-Practice Deep Link & Practice Index Status (`LessonPage.tsx`, `LessonContent.tsx`, `PracticePage.tsx`)
- In `LessonPage.tsx` / `LessonContent.tsx`, resolve the matching single-domain `practiceSet` for the lesson's domain and link **"Mở bộ Domain X practice"** directly to `/practice?set=<assessmentId>` (falling back to `/practice` only if no single-domain set matches).
- On `PracticePage.tsx`, enrich each practice set row with local progress state from `snapshot.state`:
  - Show an `In progress (X/Y answered)` badge if an active attempt exists.
  - Or show `Last score: X% (correct/total) · N attempts` if submitted attempts exist.
  - Or `Not started` if no attempts exist.

---

## 7. Explicit Non-Goals for Phase C2.10

1. **No scaled score (100–1,000), pass/fail threshold (720), or "Exam Readiness %" prediction.** Official raw-to-scaled conversion is unverified (`docs/EXAM_BLUEPRINT.md` §3), and the 62-item bank has only 2–4 items per objective.
2. **No new question-bank items or curriculum rewrites in C2.10.** Content authoring is separate from learning-effectiveness instrumentation.
3. **No backend, user accounts, telemetry, or external dependencies.**
4. **No breaking changes to `cfl.study.v1` (`STUDY_SCHEMA_VERSION = 1`), `cfl.timed-exam.v1` (`TIMED_EXAM_SESSION_VERSION = 1`), or `contentFingerprint`.** Existing saved browser state must continue to load as `ready`.
5. **No 30 micro-practice-sets (one per objective).** A 2-question quiz per objective creates excessive navigation overhead and immediate memorization; objective granularity belongs in **diagnostics and review**, while **practice sets** remain at the domain and full-bank level.
6. **No spaced-repetition scheduler (SM-2 / Leitner intervals).** With a 62-item bank and an exam window before 2026-11-14, artificial time-gating ("come back in 4 days") hinders exam prep.

---

## 8. Data-Model & Architecture Impact

### Zero Storage Schema Changes Required
All C2.10 features operate as **pure selectors and UI projections** over existing persisted structures:
- `StudyState` (`src/domain/study.ts`): already contains `attempts: StudyAttempt[]` (with `session.startedAt`, `session.submittedAt`, `session.answers`, `session.flaggedQuestionIds`, `questionIds`, `origin`) and `reviewResolutions: ReviewResolution[]`.
- `TimedExamSession` (`src/domain/timed-exam.ts`): already contains `questionIds`, `session`, `submissionReason`, and `finalResult: AssessmentResult`.
- `ContentPack` (`src/content/index.ts`): already provides `questionBankEntries` (mapping `questionId -> objectiveIds[]`), `primaryBlueprint` (mapping `domain -> objectives[]`), `publishedLessons` (mapping `lesson -> objectiveIds[]`), and `practiceSets` (mapping `practiceSet -> domainIds[]`).

### Why `cfl.study.v1` and `cfl.timed-exam.v1` Should Remain Separate in Storage
In Phase C2.8 (`docs/ASSESSMENT_ENGINE.md` §7d), `cfl.timed-exam.v1` was deliberately isolated from `cfl.study.v1` so that discarding or recovering a timed exam never touches practice history or review resolutions.
- **Architectural rule for C2.10:** Keep both storage keys and schemas untouched.
- In `ProgressPage.tsx` and `ReviewPage.tsx`, read both `useStudyState()` and `useTimedExamState()`.
- Pass the optional submitted `TimedExamSession` into `deriveProgressSummary` (or a dedicated timed-summary selector) so its performance and attempt record are visible on `/progress`, with a clear note that the timed slot holds the latest timed simulation until discarded.
- On `ReviewPage.tsx`, display open review items from `cfl.study.v1` (with `Mark reviewed` resolution) and, when a submitted `TimedExamSession` has incorrect/unanswered/flagged items, display a clearly explained **"Latest timed mock exam mistakes & flags"** section (or link directly to review them) so learners never lose visibility into their timed simulation mistakes.

---

## 9. Acceptance Criteria

1. **Lesson-to-Practice Deep Link:**
   - Every exam-mapped curriculum lesson page (`/learn/:lessonId`) links its "Mở bộ Domain X practice" CTA directly to `/practice?set=<domain-set-id>` (e.g., `/learn/evaluation-basics` links to `/practice?set=domain-2-output-validation-set`).
2. **Practice Set Status Indicators:**
   - `/practice` index rows display whether each set is `Not started`, `In progress (X/Y answered)`, or `Completed (Last: X% · N attempts)` based solely on real local data.
3. **Post-Submission Breakdown & Remediation:**
   - Submitting a multi-domain assessment (`/mock-exam`, `/mock-exam/timed`, or `mixed-foundations-set`) renders a **per-domain performance table** (`Domain`, `Weight`, `Correct / Total`, `Raw %`, and links to the mapped Lesson and Domain Practice Set).
   - Submitting a single-domain practice set renders a **per-objective breakdown table** for that domain's objectives (`Objective`, `Correct / Total`, and Lesson link).
   - Question review in `AssessmentRunner` displays the question's Domain, Objective statement, mapped Lesson link, and official Sources (`Nguồn tham chiếu`).
4. **Contextual Mistake Review (`/review`):**
   - Each item in `/review` displays its Domain code/title and Objective statement.
   - Opening an item in `/review?item=...` displays the mapped Lesson link, Domain Practice Set link, and official Sources, plus a repeat-miss notice if the question was missed in multiple submitted attempts.
   - If a submitted timed mock exam exists in `cfl.timed-exam.v1` with incorrect, unanswered, or flagged questions, `/review` surfaces those items with their domain/objective context.
5. **Transparent Progress, Objective Coverage & Attempt History (`/progress`):**
   - `/progress` displays **Unique bank exposure** (`X / 62 reviewed items seen`, `Y / 30 objectives practiced`).
   - `/progress` displays **First-seen accuracy** alongside **Latest accuracy** and **Cumulative accuracy**, with an explicit note on question-bank repetition limits (2–4 items per objective).
   - `/progress` includes an **Objective coverage & performance matrix** across all 30 official objectives showing bank item count (`2` or `4`), practiced count, latest correct count, and lesson/practice links.
   - `/progress` includes a chronological **Submitted attempt history** table covering submitted study attempts and any retained submitted timed mock exam.
6. **Honesty & Accessibility Guardrails:**
   - No scaled score (`100–1,000`), pass/fail badge, or readiness prediction appears anywhere.
   - All new tables, badges, links, and status indicators pass keyboard navigation, light/dark contrast, 390/768/1440 px responsive checks, and `axe-core` with 0 violations.

---

## 10. Proposed Implementation Tickets (Dependency Order)

### Ticket C2.10-1: Content Lookup & Assessment Breakdown Selectors (Domain / Feature Layer)
- **Scope:**
  - Add content lookup helpers in `src/content/index.ts` (e.g., `getLessonForObjective(objectiveId)`, `getLessonForDomain(domainId)`, `getPracticeSetForDomain(domainId)`, `getQuestionCurriculumContext(questionId)`).
  - Add pure breakdown selectors in `src/features/progress/selectors.ts` (or a new `src/features/progress/attempt-breakdown.ts`):
    - `deriveAttemptDomainBreakdown(result, bankEntries, blueprint)`
    - `deriveAttemptObjectiveBreakdown(result, bankEntries, blueprint)`
    - Extend `deriveProgressSummary` to compute:
      - `uniqueItemsAttempted`, `uniqueItemsAnswered`, `objectivesPracticed`
      - `firstSeenAccuracy` and `latestAccuracy` (across unique answered bank items)
      - `objectives: ObjectivePerformance[]` (all 30 objectives with `bankItemCount`, `practicedItemCount`, `latestCorrectCount`, `lessonId`, `practiceSetId`)
      - `attemptHistory: AttemptHistoryEntry[]` (chronological list of submitted attempts from `StudyState` + optional submitted `TimedExamSession`)
- **Dependencies:** None.
- **Verification:** Unit tests in `src/test/progress-selectors.test.ts`.

### Ticket C2.10-2: Lesson-to-Practice Deep Link & Practice Hub Progress Indicators
- **Scope:**
  - Update `LessonPage.tsx` and `LessonContent.tsx` so the related practice CTA links directly to `/practice?set=<domainSetId>`.
  - Update `PracticePage.tsx` to show per-set activity badges (`In progress`, `Last: X% · N attempts`, or `Not started`) derived from `useStudyState()`.
- **Dependencies:** Ticket C2.10-1 (`getPracticeSetForDomain`).
- **Verification:** Targeted unit/component tests in `src/test/lesson.test.tsx` and `src/test/practice-page.test.tsx`.

### Ticket C2.10-3: Post-Submission Breakdown & Question Context in `AssessmentRunner` and `TimedExamResultView`
- **Scope:**
  - In `AssessmentRunner.tsx`:
    - Render the per-domain breakdown table (for multi-domain assessments) or per-objective breakdown table (for single-domain sets) inside the submitted result summary, with links to mapped lessons and practice sets.
    - In post-submission question review, render Domain/Objective metadata, mapped Lesson link, and official Sources (`Nguồn tham chiếu`).
  - In `TimedExamResultView.tsx` and `QuestionPanel.tsx`:
    - Render the per-domain breakdown table for the 60-question timed exam result with lesson/practice remediation links.
    - Display the question's Domain, Objective statement, and mapped Lesson link in review mode.
- **Dependencies:** Ticket C2.10-1.
- **Verification:** Targeted component tests in `src/test/assessment-ui.test.tsx` and `src/test/timed-exam-page.test.tsx`.

### Ticket C2.10-4: Enriched Mistake Review & Timed-Exam Review Visibility (`ReviewPage.tsx`)
- **Scope:**
  - Enrich `ReviewPage.tsx` list items and detail view with Domain, Objective statement, official Sources, mapped Lesson link, Domain Practice Set link, and repeat-miss count across attempts.
  - Read `useTimedExamState()` on `ReviewPage.tsx` so that if a submitted timed exam has incorrect, unanswered, or flagged questions, they are surfaced with full domain/objective context and a link to review/manage the timed result.
- **Dependencies:** Ticket C2.10-1.
- **Verification:** Targeted component tests in `src/test/study-journey.test.tsx`.

### Ticket C2.10-5: Progress Page Upgrade — Bank Exposure, First-Seen vs. Latest Accuracy, Objective Matrix & Attempt History (`ProgressPage.tsx`)
- **Scope:**
  - Update `ProgressPage.tsx` to render:
    - Unique bank exposure (`X / 62 items`, `Y / 30 objectives`) and `First-seen` vs. `Latest` vs. `Cumulative` accuracy with a clear explanation of bank-depth limits.
    - Enhanced Domain Performance table with unique items seen, latest accuracy, and Lesson / Practice Set links.
    - Collapsible or structured **Objective Coverage & Performance** table across all 7 domains / 30 objectives showing exact counts (`practiced / total`, `latest correct / total`).
    - **Submitted Attempt History** table (including submitted `cfl.timed-exam.v1` when present).
- **Dependencies:** Ticket C2.10-1.
- **Verification:** Targeted component tests in `src/test/study-pages.test.tsx` and `src/test/progress-selectors.test.ts`.

---

## 11. Test Strategy (Targeted Local Verification vs. GitHub Actions CI)

In accordance with repository workflow rules:

### Local Verification (During C2.10 Implementation)
Run fast, targeted checks on modified modules without running the full Playwright suite or production build locally unless needed:
1. `npm run typecheck` (`tsc -b`)
2. `npm run lint` (`eslint .`)
3. Targeted Vitest runs only:
   ```bash
   npx vitest run src/test/progress-selectors.test.ts src/test/study-pages.test.tsx src/test/study-journey.test.tsx src/test/practice-page.test.tsx src/test/assessment-ui.test.tsx src/test/timed-exam-page.test.tsx src/test/lesson.test.tsx
   ```
4. `git diff --check`

### Delegated to GitHub Actions CI (`.github/workflows/ci.yml` after human approval & push)
- Full unit/integration suite (`npm test`)
- Production bundle build (`npm run build`)
- Full Chromium Playwright E2E and `axe-core` accessibility/responsive suite (`npm run test:e2e`)

---

## 12. Risks, Assumptions, and Unresolved Decisions

### Risks & Mitigations
1. **Risk — Existing E2E selectors on `/progress`, `/review`, or `/practice` could break if heading names or table captions change.**
   - *Mitigation:* Preserve all existing table accessible names (`Reviewed bank coverage by official domain`, `Personal accuracy by official domain`, `Open review items`) and heading text (`Bank coverage`, `Your performance`, `Review status`), adding new sections and columns additively.
2. **Risk — Over-interpreting 2-item objective metrics.**
   - *Mitigation:* Never display a standalone percentage bar or "Mastered" badge for a 2-item objective. Always display raw fractions (`1/2`, `2/2`) and state the bank depth limit (`2 reviewed items available for this objective`).
3. **Risk — Timed exam single-slot lifecycle (`cfl.timed-exam.v1`).**
   - *Mitigation:* When surfacing a submitted timed exam on `/progress` and `/review`, clearly badge it as `Saved timed exam slot` so the learner understands that discarding the timed exam to start a new one will also clear that single-slot record (unless they download a backup or until multi-slot timed history is desired).

### Open Decisions for Human Approval
1. **Timed exam history persistence:** Should submitted timed exams remain strictly in their single-slot `cfl.timed-exam.v1` store (read at render time by `/progress` and `/review` with zero schema changes), or would you like submitted timed exams to also append a summary/attempt record into `cfl.study.v1` so they survive when the learner discards the timed slot to start a second timed exam? *(Recommendation: Start with read-time integration in C2.10 to keep zero schema/fingerprint impact, or append a `mock-exam` attempt snapshot on timed submission if permanent history across multiple timed runs is preferred.)*
2. **Objective table presentation on `/progress`:** Should the 30-objective breakdown on `/progress` be always visible (grouped by domain) or inside native `<details>` disclosures per domain to keep the page scannable on 390px mobile screens? *(Recommendation: Group by domain or use native `<details>` open by default for domains with activity, ensuring zero horizontal overflow at 390px.)*
