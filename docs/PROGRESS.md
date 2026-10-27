# Progress Log

## Scaffold

- [x] Initial repository structure created.
- [x] React + TypeScript + Vite selected.
- [x] Product and agent instructions drafted.
- [x] GitHub CLI explicitly excluded.
- [x] Vercel SPA rewrite added.
- [x] Dependencies installed and scaffold validated (2026-10-26).
- [x] GitHub remote configured and commits pushed (2026-10-26).
- [ ] Organization renamed/created as `DevAtlasLab` and repository visibility set to private.
- [x] Official exam guide researched and verified (2026-10-26).
- [x] Learning UI shell and design system implemented (Phase B).
- [x] First lesson vertical slice implemented (sample lesson, not mapped to an official objective).
- [x] Practice mode, local persistence, review queue, progress report, and a blueprint-weighted mock-exam preview implemented (Phase C2.3, 2026-10-27); the full 60-item timed mock exam is still outstanding.
- [x] Tests and production build pass for implemented features.
- [ ] Vercel deployment verified.

## Scan of 2026-10-26 — repository preparation

- Replaced `latest` dependency ranges with a tested, mutually compatible pinned set.
- Resolved a scaffold compile error (`BrainCircuit` imported in `src/pages/DashboardPage.tsx`).
- Removed 2 critical and 1 moderate advisory by moving Vitest 3 → 4.1.12; `npm audit` now reports 0 vulnerabilities.
- Verified locally with Node 22.11.0: `typecheck` pass, `lint` pass (0 problems), `test` pass (1 file / 1 test), `build` pass (`dist/` produced).
- Verified SPA fallback with `vite preview`: `/` 200, `/learn` 200, hashed JS asset 200.
- Recorded verified official exam facts and a **partially verified** future-revision notice in
  `docs/EXAM_BLUEPRINT.md`.
- Documented GitHub organization state and manual steps in `docs/REPOSITORY_SETUP.md`.

## Phase B — design system and app shell (2026-10-26)

### Implemented

- Token-based theme system in `src/styles/tokens.css` with complete Dark and Light palettes, spacing,
  type, radius, elevation and motion scales. Dark is the default; Light and System are available from
  the topbar and Settings.
- `cfl.theme` persistence with a pre-paint bootstrap script in `index.html`, live
  `prefers-color-scheme` tracking for System mode, and safe fallbacks when localStorage is blocked.
- Responsive shell: fixed sidebar and sticky topbar on desktop, off-canvas drawer with scrim,
  `inert` main region, `Escape` handling and focus return on mobile. Skip link, focus-visible rings,
  reduced-motion support.
- Grouped primary navigation and all eight routes: `/`, `/learn`, `/practice`, `/mock-exam`,
  `/review`, `/progress`, `/glossary`, `/settings`. Catch-all 404 inside the shell.
- Reusable UI primitives: `PageHeader`, `Badge`, `Callout` (note / caution / unverified),
  `EmptyState`, `ThemeSwitcher`, `ThemePreferenceForm`.
- Representative lesson route `/learn/context-window` with objectives, Vietnamese explanation,
  preserved English terms, an interactive context-budget diagram, a worked customer-support
  scenario, an English knowledge check with per-option Vietnamese explanations, source citations,
  previous/next lesson navigation, and a sticky table of contents.
- Zod lesson schema validated at module load, plus curriculum, domain-placeholder and glossary data
  modules kept separate from UI.
- Functional glossary search (15 terms) and functional Settings page (theme choice, reset, local
  data disclosure).
- Placeholder pages (Practice, Mock exam, Review, Progress) explicitly labelled as not implemented;
  no fabricated stats, attempts or exam-format claims.

### Verification

- `typecheck`: pass (`tsc -b`, strict).
- `lint`: pass (`eslint .`, 0 problems).
- `test`: pass — 6 files / 26 tests covering theme default/persistence/system/reset, topbar switching,
  navigation and active state, mobile drawer open/close/focus return, unknown routes, lesson
  rendering, diagram interaction, correct and incorrect quiz paths, pager states, glossary
  filtering, and curriculum schema validation.
- `build`: pass (`dist/` produced; SPA preview serves every route, including deep links and unknown
  paths, with HTTP 200).
- Visual review with headless Edge at 1440×900 (dark + light) and 390×844 (mobile + drawer).
- Accessibility: axe-core 4.10.2 audited all ten routes in dark mode plus `/` and the lesson in light
  mode — **0 violations**. The first pass found low-contrast tertiary labels in row numbers, diagram
  percentages and pager labels; those were moved to the secondary text token and disabled pager
  cards now use a dashed border instead of an opacity fade.

### Known gaps

- Official exam guide was still unverified at the end of Phase B; this was resolved in Phase C0
  (Exam Guide v1.0). No domain weights, objectives or mock-exam format had been adopted at that point.
- No progress persistence, question bank, scoring engine, mock exam or review queue yet.
- The axe audit was a one-off browser run, not part of `npm test` or CI.
- No Playwright end-to-end suite yet.
- Lesson table of contents has no scroll-spy.
- The reference site `https://labaws.site/labs` returned no content during this phase, so the design
  follows the documented principles (dense, documentation-oriented, dark-first) rather than a live
  inspection.
- Repository visibility and the `DevAtlasLab` organization name are still pending manual action.

## Phase C0 — official blueprint verification (2026-10-26)

### Verified

- Found the **public** CCAO-F Exam Guide PDF linked from the official Partner Academy
  certifications page. Read **Version 1.0, effective July 2026** in full; no login was needed for the
  guide itself.
- Verified: exam code CCAO-F; **60 items**; **120 minutes** (about 135 minutes seat time); mixed
  multiple-choice / multiple-response with the required response count stated; **720** passing score
  on a **100–1,000** scale; **$99** fee; **12-month** validity; proctored online/test-center delivery.
- Verified the **seven domains and weights**: Prompting and Task Execution 14%, Output Evaluation and
  Validation 21%, Product and Model Selection 12%, Workflow Integration and Solution Design 16%,
  Configuration and Knowledge Management 12%, Governance, Risk, and Responsible Use 15%,
  Troubleshooting and Optimization 10%.
- Verified all **30 detailed objectives** and the three official sample questions (used for format
  calibration only, not copied into the product).
- Rewrote `docs/EXAM_BLUEPRINT.md` with a source register, exact URLs, access date, source-to-claim
  map, unverified items, version warning, and authentication limitations.
- Created `docs/CONTENT_COVERAGE_MATRIX.md` with all 30 objectives, current/planned content,
  general-knowledge safety, and the v1.0 guide dependency.
- The learner's pre-2026-11-14 attempt uses v1.0. The 2026-11-17 guide / 2026-12-07 content revision
  remains **partially verified** because the Pearson VUE page returned HTTP 504; it is tracked as a
  scheduling risk and not blended into v1.0.

### Not claimed

- No per-domain item counts, all-60-scored assumption, item-type split, raw-score conversion, or
  future-guide contents. No third-party study page is used as an exam-fact source.

## Phase C1 — reusable content domain model (2026-10-26)

### Implemented

- Added `src/domain/` with certification-neutral Zod schemas and inferred types:
  - `common.ts`: ids, ISO dates, source records, verification status/record, content status, and
    published/reviewed consistency rules.
  - `certification.ts`: provider, certification, exam format, passing score, domain, objective, and
    versioned blueprint. Weights must be all-or-none and total 100; published verified blueprints must
    state the core format fields.
  - `lesson.ts`: lesson sections, answer choices, single-choice and multiple-response questions,
    correct-answer validation, exam mapping (`unmapped` / `candidate` / `verified`), lesson metadata,
    glossary entries, and planned lessons.
  - `content-pack.ts`: cross-reference validation for duplicate ids, unknown source ids, unknown
    objective ids, mismatched lesson/blueprint certifications, and duplicate question ids.
- Added `src/content/` for certification-specific data:
  - Source registry with claim-level `supports` and access notes.
  - CCAO-F certification, v1.0 blueprint, seven domains, 30 objectives, and exam format.
  - Context Window sample lesson, glossary, and three planned lessons.
  - `src/content/index.ts` parses the whole pack at import time and exposes lesson/source/domain
    lookups. The UI imports the registry; shared renderers import only platform types.
- Migrated the Context Window lesson to the new model:
  - Explicit `examMapping.status: "unmapped"` with no objective ids. The plausible Domain 3
    relationship is documented but not claimed as coverage.
  - Verification metadata checked 2026-10-26 with four source ids; each question cites its sources.
  - Existing single-choice check moved into the `questions` array with Vietnamese rationales for the
    correct answer and every distractor.
- Extended `KnowledgeCheck` to render single-choice radios and multiple-response checkboxes. It scores
  multiple-response by exact set equality, disables inputs after submission, reveals correct answer
  labels textually, and focuses the feedback panel. A UI test covers set-scoring.
- Updated Dashboard, Learn, Practice, Mock exam, Glossary, and Lesson pages so verified blueprint facts
  are shown only where the data supports them. The sample remains visibly unmapped, and the mock
  exam shows the verified format while explicitly saying the timer/question bank are not built.
- Removed the superseded `types.ts`, `curriculum.ts`, `domains.ts`, `glossary.ts`, and old lesson
  modules from `src/features/curriculum/`; the folder now contains rendering code only.

### Verification

- `npm run typecheck`: pass.
- `npm run lint`: pass, 0 problems.
- `npm test`: pass — **7 files / 49 tests**.
- `npm run build`: pass. Single JS bundle **507.22 kB** (gzip **154.02 kB**) with Vite's >500 kB
  chunk-size warning; CSS 31.94 kB (gzip 6.12 kB).
- Accessibility: axe-core 4.10.2 re-run on the built app for `/`, `/learn/context-window`,
  `/mock-exam`, and `/glossary` in both dark and light themes — **0 violations**.
- Schema tests cover: valid certification/blueprint/lesson/question; single-choice exact-one rule;
  valid multiple-response; too few or too many correct choices; duplicate choice ids; duplicate
  correct ids; empty/unknown choice ids; missing lesson sources and verification; non-HTTPS source
  URLs; missing supported claims; published content that is not verified; reviewed content with no
  verification; draft content allowed unverified; duplicate pack source ids; unknown source or
  objective ids; unmapped lessons claiming objectives; verified exam facts citing only product
  documentation; weight totals; and verified published blueprints without format fields.

### Remaining gaps

- Bundle is a single chunk and now exceeds the 500 kB warning threshold; route splitting is deferred.
- No exam-mapped curriculum lesson yet (0 / 30 objectives). The Context Window sample needs an
  Associate-level rewrite before mapping can be reviewed.
- No assessment engine, question bank, mock exam, review queue, or local progress yet. (The engine
  was added in Phase C2.1; the question bank and the rest remain absent.)
- Multiple-response rendering is tested, but no multiple-response item is authored in lesson content.
- The future Pearson VUE revision notice is only partially verified; re-check before rescheduling.

## Brand integration (2026-10-26)

- Added the Dev Atlas Lab ink-tile app icon to the sidebar brand lockup, with the product name
  “Claude Foundations” and publisher line “Dev Atlas Lab”.
- Added the same mark to the mobile topbar, where the sidebar is off-canvas.
- Added SVG, 16/32 px PNG and 180 px Apple touch favicons to `index.html`.
- Committed the source brand system under `brand/`; runtime copies live in `public/brand/`.
- Re-ran typecheck, lint, tests (49), production build and a desktop/mobile dark/light smoke check.

## Phase C2.1 — deterministic assessment core (2026-10-26)

### Implemented

- Added `src/domain/assessment.ts` with certification-neutral schemas and pure operations:
  - `AssessmentDefinition` (stable id, ordered question ids, configurable policy) and
    `AssessmentSession` (id, status, current index, answers, flags, timestamps).
  - `startAssessment`, `chooseAnswer`, `toggleAnswerChoice`, `goToQuestion`,
    `goToNextQuestion`, `goToPreviousQuestion`, `toggleQuestionFlag`, `submitAssessment`, and
    `calculateAssessmentResult`.
  - Typed `AssessmentDefinitionError` / `AssessmentStateError` failures for invalid definitions,
    missing questions, duplicate references, unknown choices, invalid selections, out-of-range
    navigation, and post-submission mutations.
- Added assessment definitions to the content pack schema and registry:
  - Cross-reference validation rejects empty assessments, duplicate question ids, and unknown
    question ids at import time.
  - Added the `context-window-sample` definition over the existing sample question. It is explicitly
    sample-only and still unmapped to an official CCAO-F objective.
  - Added `assessments`, `questionBank`, `getQuestion`, `getAssessment`, and
    `getAssessmentQuestions` lookups without introducing a second question schema.
- Scoring:
  - Single-choice and multiple-response both use exact-set equality.
  - Multiple-response subsets, supersets, and duplicate selections are incorrect; there is no
    partial credit.
  - Unanswered questions are reported separately and never count as correct.
  - Results expose total, answered, correct, incorrect, unanswered, raw percentage (two decimals),
    and per-question outcomes. Scores are never stored in session state.
  - Submission is idempotent: repeated submission returns the same session and the result derived
    from the original timestamp and answers.
- UI:
  - Added `AssessmentRunner` with accessible radio/checkbox controls, answered/unanswered state,
    flag/unflag, boundary-safe previous/next navigation, a question navigator, explicit submit
    confirmation, and review after submission.
  - Practice now runs the one-question sample assessment from the content registry instead of a
    placeholder page. The start screen states that the item is not official, there is no timer, and
    nothing is saved.
  - The result panel shows Vietnamese metrics and explanations plus an explicit disclaimer that the
    raw percentage is not the official 100–1,000 scaled score and does not predict passing.
  - `KnowledgeCheck` now reuses the assessment core's `isAnswerCorrect`, so lesson checks and
    assessment scoring cannot diverge.
  - Added `src/styles/assessment.css` using existing design tokens; no redesign of the shell.
- Documentation: added `docs/ASSESSMENT_ENGINE.md` with the model, transitions, scoring rules,
  policy boundaries, UI behaviour, non-goals, and test coverage.

### Verification

- `npm run typecheck`: pass (`tsc -b`, strict).
- `npm run lint`: pass (`eslint .`, 0 problems).
- `npm test`: pass — **9 files / 70 tests**, including domain, content-pack, and component assessment tests.
- `npm run build`: pass. Production bundle: JS **531.97 kB** (gzip **159.92 kB**), CSS
  **37.68 kB** (gzip **6.71 kB**); the existing Vite >500 kB chunk warning remains.

### Known limitations

- No timer, auto-submit, or expired-session state; expiry is intentionally not modelled until a
  timer phase exists.
- No localStorage persistence, migration, attempt history, or review queue. Refreshing the page
  starts a fresh sample attempt.
- The assessment core was exercised by one sample question at the end of C2.1. Phase C2.2a added a
  six-item Domain 2 bank; there is still no 60-item mock exam, per-domain report, or official
  scaled-score conversion.
- The runner resolves all questions up front but renders one at a time; large mock exams will need
  route/state splitting and persistence before they are practical.
- At the end of C2.1 the coverage matrix recorded **0 / 30** objectives with reviewed practice items;
  C2.2a moved that to **3 / 30 partial**.

## Phase C2.2a — reviewed Domain 2 question bank (2026-10-26)

### Scope

- Selected three of the six verified Domain 2 objectives, all teachable and assessable from
  accessible Anthropic documentation:
  - `output-evaluate-accuracy` — accuracy and completeness review;
  - `output-identify-hallucinations` — hallucination and inconsistency detection;
  - `output-fact-check` — source-based fact-checking and retraction.
- Authored **six original items**: two per objective, four single-choice and two multiple-response.
- Deferred a bias item. Bias is part of the official objective wording, but no reviewed, accessible
  Anthropic source supported a defensible item in this pass; the gap is recorded instead of forcing
  a low-quality question.
- Did not implement Practice Mode selection, persistence, a full domain bank, or the mock exam.

### Content model

- Added `src/domain/question-bank.ts`. A bank entry wraps the existing `Question` schema with
  `certificationId`, `blueprintId`, `examMapping`, `contentStatus`, and `verification`; there is no
  parallel question schema.
- Bank entries must be mapped to at least one objective. Unmapped design samples must stay inside a
  lesson.
- Validation now rejects:
  - unmapped bank entries;
  - verified mappings backed by unverified content;
  - published content without verified content;
  - question sources missing from the review record;
  - duplicate question ids across lessons and the bank;
  - unknown blueprint, certification, objective, or source references.
- Added `anthropic-reduce-hallucinations-doc` and `anthropic-evaluation-docs` to the source registry,
  with checked support statements and the 2026-10-26 access date.
- Added the `domain-2-output-validation-set` assessment definition over all six bank items.
- `src/content/index.ts` now distinguishes lesson questions, the reviewed bank, and all resolvable
  questions; `getQuestionBankEntry` exposes mapping/review metadata for future Practice Mode.

### Content

| Question | Format | Objective |
|---|---|---|
| `output-accuracy-review-plan` | Single-choice | `output-evaluate-accuracy` |
| `output-accurate-but-incomplete` | Single-choice | `output-evaluate-accuracy` |
| `output-fabricated-policy-detail` | Single-choice | `output-identify-hallucinations` |
| `output-hallucination-signals` | Multiple-response | `output-identify-hallucinations` |
| `output-fact-check-retention` | Single-choice | `output-fact-check` |
| `output-reduce-unsupported-claims` | Multiple-response | `output-fact-check` |

- Each item has English learner-facing text, an explicit correct answer, a Vietnamese overall
  explanation, and a Vietnamese rationale for every distractor.
- No official guide sample or third-party exam content was copied.
- Objective mapping is verified against Exam Guide v1.0; technical claims cite the Anthropic
  evaluation and hallucination documentation.

### UI

- `/practice` now runs the reviewed six-item Domain 2 set instead of the one-item Context Window
  sample.
- The page labels the set as reviewed, original, Domain 2 / 21%, and not official; it links back to
  the unmapped Context Window sample lesson.
- No timer or persistence was added. Refreshing still discards the attempt, and full Practice Mode
  selection/history remains a later phase.

### Verification

- `npm run typecheck`: pass (`tsc -b`, strict).
- `npm run lint`: pass (`eslint .`, 0 problems).
- `npm test`: pass — **11 files / 85 tests**, including six-entry bank coverage, English/Vietnamese
  language checks, cross-reference failures, and `/practice` integration.
- `npm run build`: pass. Production bundle: JS **548.78 kB** (gzip **164.73 kB**), CSS
  **37.68 kB** (gzip **6.71 kB**); the existing Vite >500 kB chunk warning remains.

### Known limitations

- Domain 2 coverage is **partial**: 3 / 6 objectives, two items each, no lesson, and no bias item.
- No Practice Mode: no set selection, filters, saved attempts, review queue, or attempt history.
- No timer, mock exam, per-domain report, or official scaled-score conversion.
- The Context Window sample remains unmapped; its assessment definition is no longer surfaced on
  `/practice`.
- No fresh browser/axe audit was run for the new six-item `/practice` state; component and page tests
  cover the start screen and existing runner interactions.
- The production build remains a single chunk above Vite's warning threshold.

## Phase C2.2b — Domain 2 lesson and complete reviewed bank (2026-10-26)

### Scope

- Reviewed the six existing Domain 2 items and preserved all existing question ids.
- Covered the remaining three Domain 2 objectives:
  - `output-human-review` — escalation and additional verification;
  - `output-edit-adapt` — audience editing and draft comparison;
  - `output-format-selection` — inline, structured, and artifact/document output.
- Added two bias items to the existing hallucination/inconsistency objective, using Anthropic's
  Claude's Constitution for the narrow framing/equal-treatment claims it actually supports.
- Added one Domain 2 curriculum lesson mapped to all six verified objectives.
- Did not implement local persistence, attempt history, review queue, practice-set selection, a
  timer, a mock exam, or a scaled-score prediction.

### Content model

- Added `relatedQuestionIds` to the lesson schema. Lessons may link to reviewed bank questions, and
  content-pack validation rejects references that do not resolve to the bank. The field is optional
  with an empty default so the existing Context Window sample stays valid.
- Added source records for Prompting best practices, Structured outputs, artifacts, and Claude's
  Constitution, each with claim-level support statements and a 2026-10-26 access date.
- Expanded the bank to **14 items**:
  - `output-evaluate-accuracy`: 2;
  - `output-identify-hallucinations`: 4 (2 hallucination/inconsistency + 2 bias);
  - `output-fact-check`: 2;
  - `output-human-review`: 2;
  - `output-edit-adapt`: 2;
  - `output-format-selection`: 2.
- Format split: 8 single-choice and 6 multiple-response. Every multiple-response item has exactly
  three correct choices, and every distractor has a Vietnamese rationale.
- All items remain original. No official guide sample, exam dump, or third-party question bank was
  copied.

### Lesson

- Added `lessons/evaluation-basics.ts` with id `evaluation-basics`, replacing the former planned
  lesson entry.
- Route: `/learn/evaluation-basics`.
- The lesson includes objectives, Vietnamese explanations with English terminology, hallucination
  and bias distinctions, a fact-check workflow, escalation triggers, editing guidance, format
  selection, a worked scenario, an English knowledge check, and a checklist.
- Seven reviewed bank questions are linked through `relatedQuestionIds`; the lesson page renders the
  linked objective statements and a working link to `/practice`.
- Inline claims name the supporting source; the lesson page also renders the full source list.

### UI and assessment integration

- `/practice` now runs all 14 reviewed items in `domain-2-output-validation-set`.
- The Practice page links to the new Domain 2 lesson and keeps the Context Window sample lesson
  linked separately.
- Learn and Dashboard copy now state that one lesson is exam-mapped and one is a sample, instead of
  claiming there is no curriculum lesson.
- The Context Window lesson remains unmapped, its knowledge check remains intact, and its sample
  assessment definition remains in the pack but is still not the `/practice` surface.

### Verification

- `npm run typecheck`: pass (`tsc -b`, strict).
- `npm run lint`: pass (`eslint .`, 0 problems).
- `npm test`: pass — **12 files / 92 tests**, including 14-entry coverage, six-objective mapping,
  related-question resolution, English/Vietnamese language checks, cross-reference failures, lesson
  route behavior, and `/practice` integration.
- `npm run build`: pass. Production bundle: JS **590.14 kB** (gzip **176.05 kB**), CSS
  **37.68 kB** (gzip **6.71 kB**); the existing Vite >500 kB chunk warning remains.

### Coverage and limitations

- Domain 2 now has **6 / 6** objectives with a reviewed lesson and at least two reviewed items.
- Overall certification coverage is **6 / 30** objectives with reviewed lessons/items; the other
  **24 / 30** remain uncovered.
- Bias coverage is intentionally narrow: one-sided evidence, loaded framing, unequal standards, and
  protected-characteristic assumptions, grounded in Claude's Constitution. It is not a full fairness
  evaluation and should not be described as one.
- Human-review items teach risk-based escalation and validation principles; they are not medical,
  legal, or financial advice.
- No Practice Mode set selection, persistence, saved attempts, review queue, timer, mock exam,
  per-domain report, or official scaled-score conversion exists.
- No fresh browser or axe audit was run for the new lesson or the 14-item `/practice` state;
  component/page tests cover the new route, related-practice links, and knowledge-check interaction.
- The production build remains a single chunk above Vite's warning threshold.

## Phase C2.3 — assessment integrity, persistence, and study workflow (2026-10-27)

### Scope

- Expanded the reviewed bank beyond Domain 2 and made Practice Mode registry-driven.
- Added versioned local persistence with content-fingerprint compatibility checks and explicit
  recovery for corrupt, incompatible, and unavailable storage.
- Added attempt history, a derived review queue, a Progress report that separates bank coverage from
  personal performance, and a blueprint-weighted mock-exam preview.
- Split routes with `React.lazy`/`Suspense` so the production build no longer ships one oversized
  chunk.
- Did not add a timer, a complete 60-item bank, an official scaled score, a backend, or a new state
  library.

### Content

- Added **10 original reviewed items** across five previously uncovered domains:
  - Domain 1: `prompting-specific-brief`, `prompting-decompose-steps`;
  - Domain 3: `context-summarize-and-restart`, `context-high-signal-practices`;
  - Domain 4: `workflow-requirements-extraction`, `workflow-integration-checkpoints`;
  - Domain 6: `governance-human-oversight`, `governance-customer-assistant-safeguards`;
  - Domain 7: `troubleshoot-diagnose-prompt`, `troubleshoot-feedback-loop`.
- The reviewed bank is now **24 items** (13 single-choice, 11 multiple-response) across six of seven
  domains. Domain 5 still has **zero** items.
- Objective coverage moved from **6 / 30** to **15 / 30**; Domain 2 remains the only domain with a
  mapped lesson. The Context Window sample remains unmapped.
- Every new item has English learner-facing text, a Vietnamese overall explanation, and a Vietnamese
  rationale for each option. No official question, dump, or third-party item was copied.
- Added a `practiceSets` registry that declares each set's assessment and domains. Content-pack
  validation proves every question is a reviewed bank item and that declared domains exactly match
  the mapped domains.

### Persistence and assessment integrity

- Added `src/domain/study.ts` with a persisted attempt snapshot (`assessmentId`, immutable
  `questionIds`, `policy`, `origin`, session) and explicit review resolutions. Scores, queue
  membership, and progress are derived, never stored.
- Added `src/persistence/storage.ts` with the versioned `cfl.study.v1` envelope
  (`schemaVersion`, `contentFingerprint`, `savedAt`, `state`). Load distinguishes empty, ready,
  corrupt, incompatible, and unavailable; writes classify quota, security, invalid-state, and
  unavailable failures.
- Corrupt or incompatible data is preserved in raw form, blocks new writes, and can be downloaded as
  a backup before a two-step reset. Recoverable data is never deleted automatically.
- Added `src/content/fingerprint.ts`. The fingerprint covers assessment definitions, question
  types/choices/answer keys, bank mappings, and blueprint weights; prose and explanations are
  excluded. A mismatch blocks resume and scoring so old answers cannot be scored against a new key.
- `startStudyAttempt` rejects a second in-progress attempt for the same assessment; pages resume the
  existing attempt instead. Submitted attempts are immutable, and later review navigation is not
  persisted.

### Practice, review, progress, and mock exam

- `PracticePage` lists seven sets (six domain sets + one mixed set), supports `?set=<assessmentId>`
  deep links, resumes active attempts, and renders an explicit unknown-set state.
- `ReviewPage` derives the queue from submitted attempts: incorrect, unanswered, and flagged items
  (including correct-but-flagged). It filters by reason, deep-links an item, shows per-option
  rationales, supports previous/next navigation, and resolves an item only through an explicit
  "Mark reviewed" action. Opening an item never auto-resolves it.
- `ProgressPage` reports reviewed-bank coverage (items, format split, objectives, per-domain counts)
  separately from personal performance (attempts, answered/correct/incorrect/unanswered, accuracy,
  raw percentage, per-domain totals). A zero-activity learner sees real coverage and an explicit
  empty personal state.
- `MockExamPage` shows the verified 60-item format, selects **24** available reviewed items by
  published domain weight, reports the **36-item shortfall**, and lists zero availability for
  Domain 5. It has no timer and produces no scaled score or readiness claim.
- `DashboardPage` shows real saved-attempt and review counts. `SettingsPage` shows the storage key,
  schema version, fingerprint, status, and attempt counts, with backup download and two-step reset.
- Added `StudyStorageNotice`, lazily mounted in the app shell, for corrupt/incompatible/unavailable
  storage.

### Route splitting

- `src/routes/lazy-pages.ts` lazy-loads every page, with a shared `RouteFallback` and `Suspense` in
  the router. The storage notice is also lazy-loaded so content and persistence code stay out of the
  initial chunk.
- The largest JS chunks are **339.94 kB** (gzip **107.78 kB**) and **227.81 kB** (gzip
  **64.11 kB**); Vite's >500 kB chunk-size warning is gone and was not suppressed.

### Verification

- `npm run typecheck`: pass (`tsc -b`, strict).
- `npm run lint`: pass (`eslint .`, 0 problems).
- `npm test`: pass — **18 files / 123 tests**, including study-domain, storage, mock-exam,
  progress-selector, persisted-journey, and study-page suites.
- `npm run build`: pass. CSS **44.96 kB** (gzip **7.42 kB**); JS chunks as listed above; no
  chunk-size warning.
- New tests cover immutable submitted attempts, idempotent submission, exact-set and unanswered
  scoring through persistence, envelope round-trips, corrupt/incompatible/quota/security handling,
  derived review reasons and explicit resolution, weighted mock allocation and shortfall, coverage
  vs performance separation, and the persisted practice journey.

### Coverage and limitations

- Coverage is **15 / 30** objectives with reviewed items and **6 / 30** with a mapped lesson.
  Domain 5 has no content. Nine covered objectives still have no mapped lesson.
- The mock exam is a **preview**: 24 of 60 slots, shortfall 36, no timer, no auto-submit, no scaled
  score, and no readiness prediction.
- No per-domain official score report, partial credit, or migration of incompatible data.
- No backend, account, sync, or analytics; progress is local to the browser profile.
- The axe audit remains a one-off browser run, not part of `npm test` or CI, and was not re-run for
  the new study surfaces in this phase.
- No Playwright end-to-end suite yet.
- Repository visibility, the `DevAtlasLab` organization rename, and Vercel deployment remain pending
  manual action.
