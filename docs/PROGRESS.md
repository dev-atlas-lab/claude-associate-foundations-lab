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
- [x] Practice mode, local persistence, review queue, progress report, and a blueprint-weighted mock-exam preview implemented (Phase C2.3, 2026-10-27); the preview remains intentionally untimed.
- [x] Whole-domain lessons for all seven domains and at least two reviewed items per objective implemented (Phase C2.5, 2026-10-27); the Context Window sample remains deliberately unmapped.
- [x] Accessibility, end-to-end, and regression audit implemented with Playwright, axe-core, and targeted focus/landmark/contrast fixes (Phase C2.6, 2026-10-28).
- [x] GitHub Actions quality-gate workflow added for pull requests and pushes to `main` (Phase C2.7, 2026-10-28); local equivalents pass.
- [x] Tests and production build pass for implemented features.
- [x] First GitHub Actions run passed on `main` (run 40611368468, 2026-10-28).
- [x] Timed 60-question / 120-minute mock exam with persisted deadline, reload recovery, auto-submit, expiry labeling, and an immutable raw result implemented (Phase C2.8, 2026-10-28).
- [x] Full content and assessment audit completed for 62 bank items, 8 lessons, 15 glossary entries, 27 sources, domain practice sets, and timed-exam integrity (Phase C2.9, 2026-10-28); E2E expectations for the expanded Domain 7 practice set aligned with registry counts.
- [x] Learning-effectiveness instrumentation (Phase C2.10, 2026-10-29): lesson-to-practice deep links, practice set status badges, post-submission domain/objective breakdowns, question curriculum context & sources, enriched mistake review with repeat-miss detection and timed-exam visibility, and progress bank exposure, first-seen vs. latest accuracy, 30-objective coverage matrix, and submitted attempt history.
- [ ] Official scaled score and pass prediction remain unimplemented by design; no official source supports inventing them.
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

## Phase C2.4 - Domain 5 and full objective coverage (2026-10-27)

### Scope

- Give Domain 5 (Configuration and Knowledge Management) its first reviewed questions, practice set,
  and lesson.
- Extend coverage to the fifteen objectives that previously had no reviewed item: Domain 1
  (`iterate`, `adapt-strategies`), Domain 3 (`product-feature-selection`, `model-family-selection`,
  `model-task-fit`), Domain 4 (`research-planning`, `solution-design`,
  `stakeholder-communication`), Domain 6 (`data-privacy`, `policies`), and Domain 7
  (`optimize-workflows`).
- Audit Domain 2 for quality without inflating counts. Its fourteen items were left unchanged.

### Content

- Added ten official Anthropic sources to `src/content/sources.ts`: project overview/management,
  project RAG, connectors, Google Workspace connectors, research mode, models overview, choosing a
  model, the Privacy Policy, and the Usage Policy. Each records what it supports and the
  `accessedAt` date of 2026-10-27.
- Extracted the duplicated `reviewedEntry` factory into
  `certifications/claude-associate-foundations/bank-helpers.ts`. Every bank file now imports one
  validated review wrapper instead of copying schema logic.
- Added `question-bank-domain5.ts` (8 items, 2 per Domain 5 objective),
  `question-bank-expansion-a.ts` (10 items across Domains 1 and 3), and
  `question-bank-expansion-b.ts` (12 items across Domains 4, 6, and 7). All three are spread into
  `reviewedQuestionBank`, so there is still one registry and one schema.
- Every new objective got one single-choice and one multiple-response item, and every
  multiple-response stem states the required selection count.
- Model-selection items describe efficiency-first and capability-first approaches instead of freezing
  current model names, prices, or limits.
- Added `configuration-basics` (Domain 5, all four objectives) and `prompt-structure` (Domain 1, all
  four objectives) as reviewed curriculum lessons. `workflow-design` is now the only planned lesson.
- Added the `domain-5-configuration-set` assessment and practice entry; expanded the Domain 1, 3, 4,
  6, and 7 sets; the mixed set now derives its question ids from the reviewed bank.

### UI and integrity fixes

- Lesson practice callouts and link labels now derive their domain label from the lesson's objective
  mapping instead of hardcoding "Domain 2 practice".
- Dashboard and Progress copy derive totals from the registry; no hardcoded bank size remains.
- Progress hints switch to accurate wording when every objective and domain is covered.

### Verification

- `npm run typecheck`: pass (`tsc -b`, strict).
- `npm run lint`: pass (`eslint .`, 0 problems).
- `npm test`: pass — **19 files / 141 tests**. New coverage in
  `src/test/domain-5-content.test.tsx` checks lesson mapping, per-objective item counts, practice-set
  wiring, English/Vietnamese language separation, stated selection counts, and exact-set scoring
  (partial and extra selections both fail). Existing suites were updated for the new totals and the
  registry-derived mixed set.
- `npm run build`: pass. CSS **44.99 kB** (gzip **7.43 kB**), no chunk-size warning.
- `git diff --check`: clean (no whitespace errors).

### Coverage and limitations

- Coverage is now **30 / 30** objectives with reviewed items and **14 / 30** with a mapped lesson,
  across **7 / 7** domains. The bank holds **54 items** (28 single-choice, 26 multiple-response).
- Depth is uneven: eight objectives still have a single reviewed item, and Domains 3, 4, 6, and 7
  have no mapped lesson.
- The mock exam is still a **preview**: 54 of 60 slots, shortfall 6, no timer, no auto-submit, no
  scaled score, and no readiness prediction.
- Help Center pages for projects, connectors, and research are JavaScript-rendered; their body text
  was read through search extracts, so exact UI steps may drift and are not quoted as fixed.
- No new persistence, scoring rules, backend, or dependencies were introduced. Changes were left
  uncommitted at the end of this phase and were later included in commit `50efba5`.

## Phase C2.5 - Whole-domain lessons and question depth (2026-10-27)

### Scope

- Publish `workflow-design` and add one mapped curriculum lesson for each remaining domain: Domain 3,
  Domain 4, Domain 6, and Domain 7.
- Audit the eight objectives that had only one reviewed item and add a second item only where it
  assessed a distinct decision and the sources supported it.
- Review the existing bank for substantive defects, source overreach, duplicate assessment, and
  language-policy violations without restyling every item.
- Keep scoring, persistence, review-queue behavior, Practice Mode, Progress, and the mock-exam preview
  intact.

### Content

- Added the official Anthropic Engineering source **Building effective agents** (`accessedAt`
  2026-10-27). The source record notes that its December 2024 tooling details have changed, so only
  the workflow patterns, simplicity, measurement, and human-checkpoint guidance are used.
- Added four reviewed curriculum lessons:
  - `product-selection` (Domain 3, all four objectives, order 5);
  - `workflow-design` (Domain 4, all five objectives, order 6);
  - `governance-responsible-use` (Domain 6, all four objectives, order 7);
  - `troubleshooting-optimization` (Domain 7, all three objectives, order 8).
- Every new lesson has a Vietnamese explanation, preserved English terminology, a worked scenario,
  key terms, takeaways, one English knowledge check with Vietnamese per-option rationales, and a
  `relatedQuestionIds` list that resolves to reviewed bank items. Lesson order remains append-only.
- Added `question-bank-depth.ts` with eight original items, one for each previously single-item
  objective. Four are single-choice and four are multiple-response; every multi-response item has
  exactly three correct choices and states the selection count.
- Strengthened source traceability on the existing decomposition, solution-design, workflow-checkpoint,
  and customer-assistant safeguard items by adding the workflow-pattern or Usage Policy source where
  it directly supports the claim. Existing question IDs were preserved.
- Emptied `plannedLessons`: all seven domains now have a published mapped lesson, so no roadmap entry
  is advertised as pending work.
- Updated Learn, Dashboard, and Mock Exam copy to derive lesson counts and practice labels from the
  registry. The mock preview now explains that 60 of 62 items are selected with no shortfall, and that
  it still has no timer or scaled score.

### Audit result

- All eight previously single-item objectives now have two items:
  `prompting-create-effective-prompts`, `prompting-task-decomposition`,
  `workflow-requirements-analysis`, `workflow-integrate`, `governance-use-case-fit`,
  `governance-ethics`, `troubleshoot-diagnose`, and `troubleshoot-adjust`.
- No objective has fewer than two reviewed items. Domain 2's hallucination/bias objective remains the
  deepest at four items because two distinct sub-skills (hallucination/inconsistency and bias) are
  intentionally assessed.
- The audit did not find a scoring, persistence, or fingerprint defect. No question IDs, answer keys,
  scoring rules, storage format, or review-queue semantics were changed.
- The Context Window lesson remains explicitly unmapped. It was not relabelled as Domain 3 coverage.

### Verification

- `npm run typecheck`: pass (`tsc -b`, strict).
- `npm run lint`: pass (`eslint .`, 0 problems).
- `npm test`: pass — **19 files / 143 tests**. New assertions require every official objective to
  have at least two reviewed items, all 30 objectives to have a mapped lesson, and the mock preview to
  select 60 of the 62 items with zero shortfall and no duplication.
- `npm run build`: pass (production build; no chunk-size warning).
- `git diff --check`: clean (no whitespace errors).

### Coverage and limitations

- Coverage is now **30 / 30** objectives with reviewed items and **30 / 30** objectives with a mapped
  lesson, across **7 / 7** domains. The bank holds **62 items** (32 single-choice, 30
  multiple-response), and every objective has at least two items.
- Published lessons: **8** (7 mapped curriculum lessons plus the unmapped Context Window sample).
- The mock exam is still a **preview**: 60 of 60 slots, shortfall 0, two bank items unselected by the
  deterministic allocation, no timer, no auto-submit, no scaled score, and no readiness prediction.
- Lesson coverage means reviewed content exists for each objective. It is not a guarantee that a
  learner is exam-ready, and no domain is claimed to be exhausted.
- Help Center pages for projects, connectors, and research remain JavaScript-rendered; their body
  text was read through search extracts, so exact UI steps may drift and are not quoted as fixed.
- No new persistence, scoring rules, backend, or dependencies were introduced. Changes were left
  uncommitted at the end of this phase and were later included in commit `50efba5`.

## Phase C2.6 - Accessibility, end-to-end, and regression audit (2026-10-28)

### Scope

- Re-derived the content and route state from the repository rather than prior reports: **8 published
  lessons** (7 mapped + the unmapped Context Window sample), **62 reviewed items** (32 single-choice,
  30 multiple-response), **30 / 30** objectives mapped, **8 practice sets**, and a **60 / 60** mock
  preview with no shortfall.
- Added a Chromium Playwright suite covering navigation, all lessons, practice and exact-set scoring,
  persistence and recovery, review/progress derivation, theme persistence, responsive widths, and
  accessibility. The suite runs against the **production build** served by `vite preview`, so deep-link
  and refresh behavior matches the deployed SPA rather than the dev-only StrictMode lifecycle.
- Added axe-core scans and manual keyboard/focus checks for the shell, both themes, all lessons,
  Practice (empty, start, question, submitted, unknown-set), Review (empty, populated, detail), Progress
  (empty and populated), Mock exam, Glossary, Settings, not-found states, and the corrupt-storage
  notice.
- Did not add a timer, auto-submit, scaled score, readiness prediction, new mock engine, new content,
  a new persistence format, or a scoring change. Question IDs, answer keys, scoring, fingerprinting,
  and assessment semantics are unchanged.

### Genuine fixes found by the audit

- **Question focus:** `AssessmentRunner` moved focus to the question legend only when the session
  changed, not when the active question index changed. It now moves focus on both, so Previous/Next
  and the navigator announce the new stem.
- **Knowledge-check retry:** "Try again" removed the focused button and dropped focus to `<body>`. Focus
  now returns to the previously selected answer (or the first input), and the regression test asserts
  the exact target.
- **Reset confirmations:** Settings and `StudyStorageNotice` left focus on `<body>` when the confirmation
  replaced the trigger, and the notice left it on `<body>` after a successful reset. Focus now moves to
  the confirm action, returns to the trigger on cancel, and moves to `main` when the blocking notice
  disappears.
- **Review resolution:** marking an item reviewed replaced the focused button and dropped focus. The
  resolved state's heading is now focusable through a narrow `EmptyState` extension and receives focus.
- **Duplicate landmark name:** the Practice set overview and the assessment start screen both exposed
  the same region name. The overview now has a distinct accessible name.
- **Invalid ARIA role:** the storage notice used `role="alert"`/`status` on `<aside>`, which axe rejects
  as an unsupported role. It is now a neutral `<div>` with the same live-region role and label.
- **Contrast:** review option keys used the tertiary text token on tinted correct/incorrect rows
  (3.66:1). They now use the matching `--ok` / `--danger` token on those states.
- **Test-runner isolation:** Vitest was collecting the Playwright `*.spec.ts` files. `vite.config.ts`
  now excludes `tests/e2e/**` so `npm test` and `npm run test:e2e` remain separate gates.

### Automated browser coverage

| Flow | Spec | Tests | Result |
|---|---|---:|---|
| A. Shell, lesson list, all 8 lessons, mappings, pager, deep links, invalid IDs, 404, Context Window unmapped | `navigation.spec.ts` | 18 | PASS |
| B. Practice selection, `?set=`, answer change, flags, persistence across questions, exact-set multiple response, unanswered vs incorrect, submitted review, correct-but-flagged, unknown set | `practice.spec.ts` | 7 | PASS |
| C. In-progress reload, valid restore, corrupt JSON, stale fingerprint, incompatible schema, blocked/unreadable storage, no silent resume, two-step reset, backup downloads | `persistence.spec.ts` | 9 | PASS |
| D. Review derivation, mark-reviewed persistence, filters, zero activity, coverage vs performance, dashboard/mock registry counts, 60-slot allocation | `review-progress.spec.ts` | 7 | PASS |
| E. Dark default, topbar and Settings switching, System live matchMedia, reload persistence | `theme.spec.ts` | 5 | PASS |
| Accessibility, heading order, landmarks, skip link, drawer focus trap, question labels, focus management, reduced motion | `accessibility.spec.ts` | 48 | PASS |
| Responsive 390 / 768 / 1440 widths, overflow, control clipping, mobile runner and drawer | `responsive.spec.ts` | 10 | PASS |

**Total: 104 Playwright tests, 104 passed.** All tests import the real content registry as fixtures and
use isolated browser contexts; no network calls or shared storage are involved.

### Accessibility result

- **65 axe scans, 0 violations:** 32 states in dark theme, the same 32 in light theme, plus the open
  mobile drawer. No axe rules were disabled or excluded globally. CSS transitions are finished before
  each scan so axe samples the resting state rather than a 120 ms reveal transition.
- Manual checks passed for one `<main>`/`<banner>`/`Sections` navigation per route, exactly one `h1`,
  no skipped heading levels across 20 routes, skip link as the first keyboard stop, drawer focus trap
  and focus return, single/multiple-response labels, Space activation, textual correct/your-answer/
  unanswered state, disabled controls after submission, route-change focus to `main`, and reduced
  motion (`scroll-behavior: auto`, transitions and animations reduced to near-zero).
- Responsive scans at 390, 768, and 1440 px found no horizontal page overflow and no controls outside
  the viewport. The lesson table of contents is hidden below 1200 px as designed.

### Verification

- `npm run typecheck`: pass (`tsc -b`, strict, including the E2E TypeScript project).
- `npm run lint`: pass (`eslint .`, 0 problems).
- `npm test`: pass - **19 files / 145 tests**.
- `npm run test:e2e`: pass - **7 files / 104 tests** against the production preview.
- `npm run build`: pass. CSS **45.14 kB** (gzip **7.44 kB**); largest JS chunks **426.00 kB**
  (gzip **116.64 kB**) and **339.97 kB** (gzip **107.80 kB**); no chunk-size warning.
- `git diff --check`: no whitespace errors; Git only reports CRLF normalization warnings for edited
  files.

### Limitations

- Playwright is Chromium-only. Firefox and WebKit are not installed or tested. (C2.7 later added a CI
  workflow for the Chromium gates, which passed on GitHub on 2026-10-28.)
- axe is automated and cannot prove screen-reader usability. Manual NVDA/VoiceOver passes remain a
  human follow-up, especially for the question navigator, review detail, and storage recovery notice.
- The scans finish CSS transitions before analysis; a real 120 ms colour-transition flash on newly
  inserted buttons is not treated as a contrast failure but is not animated away either.
- At the end of C2.6, the Timed Mock Exam was still deliberately unimplemented. Phase C2.8 later added
  the timer, auto-submit, expiry, reload recovery, and raw result; it still has no scaled score or
  readiness prediction. The `/mock-exam` preview remains a 60-of-60 browsing exercise, not a
  simulation.
- Vercel deployment remains unverified because no project is connected. The production preview proves
  the SPA build and deep-link fallback locally, not on Vercel.
- Phase naming: the source-of-truth docs use C2.5 for content completion and contain no C3.1 phase;
  this audit is therefore recorded as C2.6, not as a new content phase.
- All C2.5 and C2.6 changes were left uncommitted at the end of this phase; they were later included
  in commit `50efba5` and pushed to `origin/main`.

## Phase C2.7 - CI quality gates and release readiness (2026-10-28)

### Scope

- Inspected the checkout rather than relying on prior reports: branch `main` at `2ed3408`, with C2.5
  and C2.6 work still uncommitted at inspection time. Re-derived **8 published lessons**, **62 reviewed items**, **30 / 30**
  objectives covered, **19 files / 145 unit/integration tests**, **7 files / 104 Playwright tests**,
  and **65 axe scans** from the repository.
- Added `.github/workflows/ci.yml` for every pull request and every push to `main`. No workflow
  existed before this phase.
- Did not implement the Timed Mock Exam, change application behavior, alter content, or change test
  assertions.
- Did not commit, push, deploy, stash, reset, amend, or rewrite history.

### Workflow

- Node.js is read from `.nvmrc` (major 22, the project LTS baseline) with npm dependency caching.
- `npm ci` installs from the lockfile; `typecheck`, `lint`, `test`, and `build` run as separate
  steps so a failure is attributable to one gate.
- `npx playwright install --with-deps chromium` installs the Chromium build selected by the locked
  Playwright 1.64.1 version, plus the Ubuntu system libraries.
- `npm run test:e2e` runs the existing Playwright configuration unchanged. Its `webServer` rebuilds
  and serves the production bundle through `vite preview` on `127.0.0.1:4173`, so deep links,
  refreshes, and the SPA fallback are part of CI.
- The job sets `CI=true`, which enables `forbidOnly`, one retry, two workers, and (via the Playwright
  config change below) the HTML reporter.
- On failure, `test-results/` and `playwright-report/` upload as `playwright-failure-artifacts` with
  seven-day retention. Traces are already captured with `trace: "retain-on-failure"`.
- Permissions are limited to `contents: read`; the workflow uses no secrets, no deployment step, no
  browser matrix, and no third-party actions beyond checkout, setup-node, and upload-artifact.

### Test configuration

- `playwright.config.ts` now adds the built-in HTML reporter only when `CI` is set. Local runs keep
  the existing list reporter. Test selection, assertions, retries, and accessibility scans are
  unchanged.
- No test was skipped, weakened, or excluded to satisfy CI.

### Verification

- `npm ci`: pass after stopping two stale project-local Vite dev servers that held a Windows file
  lock on `node_modules/@esbuild/win32-x64/esbuild.exe`. The lockfile installed cleanly with
  `npm audit` reporting 0 vulnerabilities. Local Node 22.11 printed `EBADENGINE` warnings for
  `@vitejs/plugin-react@5.2.0` and `eslint-visitor-keys@5.0.1`, whose ranges require Node 22.12+;
  CI resolves the latest Node 22 from `.nvmrc`, which satisfies those ranges.
- `npm run typecheck`: pass (`tsc -b`, strict, including `tsconfig.e2e.json`).
- `npm run lint`: pass (`eslint .`, 0 problems).
- `npm test`: pass - **19 files / 145 tests**.
- `npm run build`: pass. CSS **45.14 kB** (gzip **7.44 kB**); JS chunks up to **426.00 kB**
  (gzip **116.64 kB**); no chunk-size warning.
- `npm run test:e2e`: pass - **104 tests**, including all **65 axe scans** with 0 violations.
- `CI=true npm run test:e2e`: pass - **104 tests with 2 workers, one retry, `forbidOnly`, and the
  HTML reporter**, matching the workflow branch. No retries were needed.
- `git diff --check`: pass. Git only reports CRLF normalization warnings.
- GitHub Actions run
  [40611368468](https://github.com/dev-atlas-lab/claude-associate-foundations-lab/actions/runs/40611368468)
  on `main`: **success** in 3 minutes. Checkout, Node setup, `npm ci`, typecheck, lint, unit tests,
  production build, Chromium installation, and E2E/accessibility all succeeded. The failure-artifact
  upload step was skipped because the job passed.

### Status and limitations

- The workflow is committed and was executed successfully by GitHub Actions on `main`. Later runs
  must still pass on their own; this log records the first verified run, not a permanent guarantee.
- E2E and axe coverage in CI is Chromium-only. Firefox/WebKit, manual NVDA/VoiceOver testing,
  cross-browser compatibility, and Vercel deployment remain unverified.
- CI uses a single Ubuntu runner and two Playwright workers; the suite takes about two minutes
  locally and has a 30-minute job timeout for slower hosted runners.
- The Playwright `webServer` rebuilds the bundle even though the workflow already ran `npm run
  build`. This keeps the existing local/CI command identical and was preferred over adding a
  CI-only build-skip switch.
- Local Node 22.11 is below the engine range of two dev dependencies. CI avoids this by using the
  latest Node 22; upgrading the local runtime or the `engines` field remains a follow-up.
- The C2.5-C2.7 implementation was committed as `50efba5` and pushed to `origin/main` on 2026-10-28;
  the verified CI status was recorded in a follow-up documentation commit. No deployment was
  performed.

## Phase C2.8 - Timed mock exam

Status: implemented, verified locally, committed as `8631d55`, and pushed to `origin/main` (2026-10-28).

### Scope

- Preserved the untimed `/mock-exam` preview exactly: 60-of-60 items, no timer, no scaled score.
- Added a separate `/mock-exam/timed` simulation using the verified blueprint's 60-item /
  120-minute format. Current eligibility is 60 selected from 62 reviewed items with zero shortfall.
- Timed selection uses the published domain weights, availability caps, and the attempt id as a
  deterministic seed. A persisted attempt always reproduces its original order; a new attempt gets a
  different deterministic selection. No duplicate, filler, or invented question is allowed.
- Added a separate single-slot store at `cfl.timed-exam.v1` with its own versioned envelope and
  content fingerprint. Practice data at `cfl.study.v1` is independent and is never migrated or
  cleared by timed-exam recovery.
- Added an authoritative persisted `deadlineAt`, wall-clock countdown, reload resume, auto-submit,
  and immutable retained result. Manual and `time-expired` submissions are distinguished.
- Added the timed intro, session, timer, question navigator, recovery, result, and review UI.
- Added the preview-to-timed CTA and a separate "Timed simulation" dashboard row.

### Architecture

- `src/domain/timed-exam.ts` composes the shared assessment primitives rather than duplicating
  scoring. It validates the attempt invariants, derives remaining time, and implements idempotent
  expiry and submission transitions.
- `src/content/timed-exam.ts` reads item count and duration from the verified blueprint, computes
  eligibility, and builds the timed fingerprint from the shared content fingerprint.
- `src/domain/mock-exam.ts` exposes seeded selection over the existing weighted allocation.
- `src/persistence/timed-exam-storage.ts` handles envelope validation and corrupt/incompatible/
  unavailable/security/quota states. `src/persistence/timed-exam-store.ts` owns the single slot,
  blocks writes during unrecovered corruption, and exposes explicit discard.
- `src/features/timed-exam/` contains the timer hook and UI; `src/pages/TimedExamPage.tsx` wires the
  store to start/save/discard/recovery actions.

### Deadline and recovery guarantees

- Remaining time is always `max(0, deadlineAt - now)`. The one-second interval only refreshes the
  display; it is not a decrementing state. Visibility, focus, and pageshow events re-read the clock.
- Expiry submits with `submittedAt = deadlineAt`, so repeated notices produce the same result.
  A late manual submission is classified as `time-expired`. Answer, flag, and navigation mutations
  after the deadline are discarded and expire the attempt instead.
- Submitted attempts are not re-scored. Review navigation is local UI state only.
- On corrupt or incompatible data, nothing is resumed, scored, migrated, or deleted automatically.
  The UI offers the raw payload as a download and requires a two-step discard. Starting a new attempt
  is blocked until recovery.
- If storage is unavailable or a write fails, the exam continues in memory with an explicit warning;
  the app does not claim that the change was saved. Reload loss is possible in that state.
- Discarding removes only `cfl.timed-exam.v1`. Practice attempts, review items, and settings remain.

### Scoring and limits

- Single-choice and exact-set multiple-response questions are all-or-nothing; there is no partial
  credit. Unanswered questions are counted separately from incorrect answers.
- The result shows the raw `correct / total` percentage only (for example, 1/60 is 1.67%). There is
  no scaled 100-1,000 score, pass threshold, or readiness prediction.
- Because the app is frontend-only, the deadline uses the device clock. A user changing the system
  clock can affect remaining time, and a closed browser submits when the app next runs, not while it
  is closed. Local data can be cleared by the user or browser policy.

### Accessibility and responsive coverage

- The countdown uses `role="timer"` with `aria-live="off"`. A separate polite status region announces
  only the 10-, 5-, and 1-minute warnings, plus expiry. Warning and expired states use text as well
  as color.
- Keyboard coverage includes answering, flags, previous/next, the navigator, submit confirmation,
  recovery, and result review. Focus moves to the question heading on navigation and to confirmation
  headings when they open.
- The timed intro, question, and result states are included in the both-theme axe suite. Responsive
  checks cover 390, 768, and 1440 px, including the navigator reflow and no horizontal overflow.

### Verification

- `npm run typecheck`: pass.
- `npm run lint`: pass with 0 problems.
- `npm test`: pass - **23 files / 177 tests**.
- `npm run build`: pass. The `TimedExamPage` chunk is 41.25 kB (11.69 kB gzip); no chunk-size warning.
- `npm run test:e2e`: pass - **116 Playwright tests across 8 files**, including 9 timed-exam tests,
  clock-controlled expiry, corrupt/unavailable storage, keyboard behavior, axe scans, and responsive
  checks. The axe suite now reports **71 scans** (35 states in both themes plus the open mobile
  drawer) with 0 violations.
- `git diff --check`: exit 0 with only Git's LF-to-CRLF normalization warnings; no whitespace errors.

### Status and limitations

- The timed exam is a practice simulation, not an official exam form, official score, or readiness
  claim. The bank still has two to four items per objective, so depth remains limited.
- E2E coverage is Chromium-only. Firefox/WebKit, manual screen-reader testing, device-clock
  tampering, and Vercel deployment remain unverified.
- This phase added no runtime dependency. At implementation time the work was uncommitted; it was
  later committed as `8631d55` and pushed to `origin/main`. No stash, reset, or deployment was part
  of the implementation.

## Phase C2.9 - Content and assessment audit

Status: completed locally (2026-10-28); corrections are unstaged for human review. One timed-allocation
expectation is accepted as a documented deviation. No commit, push, branch change, deployment, or
destructive cleanup was performed.

### Scope

- Audited all **62** reviewed bank items, including the two items that are not selected in a given
  60-item attempt. Every item received an explicit `pass`, `minor-fix`, `major-fix`, or
  `needs-review` status in `docs/CONTENT_AUDIT_2026-10-28.md`.
- Audited all **8** published lessons, including the intentionally unmapped `context-window` sample;
  all **15** glossary entries; all **27** registered sources; all lesson `relatedQuestionIds`; and
  the seven domain practice sets plus the mixed set.
- Rechecked the timed mock's 60-item / 120-minute format, domain weights, deterministic seeded
  selection, distinctness, no-filler rule, and shortfall behavior.

### Results

- Questions: **60 pass, 2 minor-fix, 0 major-fix, 0 needs-review**.
- Lessons: **6 pass, 0 minor-fix, 2 major-fix, 0 needs-review**.
- Glossary: **13 pass, 2 minor-fix**.
- Sources: **26 pass, 1 minor-fix**; all 27 URLs returned HTTP 200 on 2026-10-28.
- Domain practice sets: **3 pass, 4 minor-fix**. Domains 1, 4, 6, and 7 were missing reviewed bank
  items; the definitions and descriptions now include all mapped items.
- Timed integrity: **pass** for 60 distinct items, 120 minutes, exact weights, no duplicates/filler,
  and zero shortfall. The allocation expectation is accepted as a documented deviation below; no code
  change was made and the original target is not claimed.

### Corrections

- Corrected project-memory wording in `config-project-brief-setup`, `config-project-context-scope`,
  `configuration-basics`, `product-selection`, and the `anthropic-projects-manage` source entry. A new
  chat does not receive the full transcript of another chat, but project memory can retain some
  information; project knowledge and instructions remain the reliable shared configuration. Also
  corrected a `product-selection` callout title that conflated project memory with project
  knowledge/RAG retrieval.
- Added the missing items to the Domain 1, 4, 6, and 7 practice sets and updated their descriptions.
- Tightened the `context-rot` and `hallucination` glossary definitions to match official wording.
- Added targeted tests for domain-set alignment, exact domain weights, and the timed allocation.
- Updated `tests/e2e/practice.spec.ts` and `tests/e2e/review-progress.spec.ts` so expectations for the
  `domain-7-troubleshooting-set` fixture (`openReviewCount`, `unansweredCount`, and
  `expectedRawPercentage`) derive from `questions.length` instead of hardcoding the previous 4-item
  counts.

### Timed allocation decision

The task brief listed `8 / 13 / 7 / 10 / 7 / 9 / 6`. That allocation is impossible with the current
bank because Domain 6 has only **8** reviewed items. The selector correctly caps Domain 6 at 8 and
gives the spare slot to Domain 3, producing **`8 / 13 / 8 / 10 / 7 / 8 / 6`** while filling 60
distinct items with no filler. The project owner accepted this actual allocation on 2026-10-28 as a
documented deviation. No code change was made, and the original target is not claimed. Adding a ninth
Domain 6 item would be a separate content-authoring decision and would increase the bank to 63; it was
not done in this audit.

### Verification

- `git diff --check`: pass with only Git's LF-to-CRLF normalization warnings; no whitespace errors.
- `npm run typecheck`: pass.
- `npm run lint`: pass with 0 problems.
- `npm test`: pass (**23 files / 178 tests**).
- `npm run build`: pass.
- `npm run test:e2e`: pass (**116 Playwright tests across 8 files**).

## Phase C2.10 - Learning effectiveness instrumentation (2026-10-29)

### Scope

- Implemented all five tickets (`C2.10-1` through `C2.10-5`) from
  `docs/LEARNING_EFFECTIVENESS_DISCOVERY.md` with zero changes to `cfl.study.v1`,
  `cfl.timed-exam.v1`, or `contentFingerprint`.
- Added curriculum lookup helpers (`getLessonForObjective`, `getLessonForDomain`,
  `getPracticeSetForDomain`, `getQuestionCurriculumContext`) in `src/content/index.ts`.
- Added pure read-time breakdown and aggregation selectors in `src/features/progress/selectors.ts`:
  - `deriveAttemptDomainBreakdown` and `deriveAttemptObjectiveBreakdown`;
  - `deriveAggregatedReviewItems` across `cfl.study.v1` and submitted `cfl.timed-exam.v1` sessions,
    with domain/objective enrichment, remediation links, and `repeatMissCount`;
  - Extended `deriveProgressSummary` with unique bank exposure (`uniqueItemsAttempted`,
    `uniqueItemsAnswered`, `objectivesPracticed`), `firstSeen` vs. `latest` vs. `cumulative`
    accuracy, a 30-objective performance matrix (`ObjectivePerformance[]`), and chronological
    `attemptHistory` (`AttemptHistoryEntry[]`).
- Linked every exam-mapped lesson's practice CTA directly to `/practice?set=<domainSetId>` and
  added real local status badges (`Not started`, `In progress`, `Completed`) to `/practice` rows.
- Added post-submission per-domain / per-objective breakdown tables and question curriculum context
  (Domain, Objective statement, mapped Lesson link, Domain Practice link, and official Sources) to
  `AssessmentRunner`, `TimedExamResultView`, and `QuestionPanel`.
- Upgraded `ReviewPage` to show Domain/Objective context, official Sources, Lesson and Practice
  remediation links, repeat-miss notices, and submitted timed-exam mistakes/flags.
- Upgraded `ProgressPage` to report unique bank exposure, First-seen vs. Latest accuracy, the
  30-objective coverage matrix, and chronological submitted attempt history.

### Verification

- `npm run typecheck`: pass (`tsc -b`, strict).
- `npm run lint`: pass (`eslint .`, 0 problems).
- Targeted Vitest suite (`progress-selectors`, `lesson`, `practice-page`, `assessment-ui`,
  `timed-exam-page`, `study-journey`, `study-pages`): **7 files / 50 tests pass**.
- `git diff --check`: clean.
- Committed as `38b59b6` and pushed to `origin/main`; GitHub Actions CI run `40797871265` passed all
  steps (typecheck, lint, unit/integration tests, production build, and Playwright E2E + axe
  accessibility).

## Phase C2.11 - Focused "Practice Open Review Items" runner (2026-10-29)

### Scope

- Added `buildReviewPracticeSet` and `findCorrectlyAnsweredStudyReviewItems` in
  `src/features/progress/selectors.ts` to derive a deduplicated, filter-aware in-memory assessment
  definition over the open review queue (`All`, `Incorrect`, `Unanswered`, or `Flagged`) without
  mutating `cfl.study.v1`, `cfl.timed-exam.v1`, or `contentFingerprint`.
- Updated `src/pages/ReviewPage.tsx` with a `Practice open items (N)` action and a dedicated
  `/review?mode=practice` view (`ReviewPracticeView`) powered by `AssessmentRunner` (`persisted =
  false`).
- Added a post-submission `Review queue resolution` section on `/review?mode=practice` so learners
  can explicitly mark the open `cfl.study.v1` review items they answered correctly as reviewed while
  retaining any missed or unanswered items in the queue.

### Verification

- `npm run typecheck`: pass (`tsc -b`, strict).
- `npm run lint`: pass (`eslint .`, 0 problems).
- Targeted Vitest suite (`src/test/progress-selectors.test.ts` and `src/test/study-journey.test.tsx`):
  pass.
- `git diff --check`: clean.
- Committed as `3e90c92` and pushed to `origin/main`; GitHub Actions CI run `40800441329` passed all
  steps (typecheck, lint, unit/integration tests, production build, and Playwright E2E + axe
  accessibility).

## Phase C2.12 - Domain 6 9th reviewed item & Associate-refined Context Window lesson (2026-10-29)

### Scope

- Added `governance-privacy-third-party-connector` (single-choice, mapped to
  `governance-data-privacy`) to `src/content/certifications/claude-associate-foundations/question-bank-expansion-b.ts`,
  `domainSixGovernanceAssessment` (`src/content/certifications/claude-associate-foundations/assessments.ts`),
  and `governanceResponsibleUseLesson.relatedQuestionIds`
  (`src/content/certifications/claude-associate-foundations/lessons/governance-responsible-use.ts`).
- The reviewed question bank now totals **63** items (33 single-choice, 30 multiple-response) with
  **9** reviewed Domain 6 items, allowing the 60-item timed simulation and untimed mock preview to
  fill the exact blueprint-weighted distribution **`8 / 13 / 7 / 10 / 7 / 9 / 6`** without requiring
  the previous Domain 6-to-Domain 3 fallback.
- Refined `src/content/certifications/claude-associate-foundations/lessons/context-window.ts` for the
  Associate audience by connecting context-window working memory, token budgeting, and `context rot`
  to everyday Claude workflows (Projects knowledge, chat history, file attachments, and summarizing
  state into a clean chat), while preserving its `kind: "sample"` and `examMapping.status:
  "unmapped"` invariants.

### Verification

- `npm run typecheck`: pass (`tsc -b`, strict).
- `npm run lint`: pass (`eslint .`, 0 problems).
- Targeted Vitest suite (`question-bank`, `timed-exam-content`, `progress-selectors`, `curriculum`,
  `lesson`, `domain-2-content`, `mock-exam`): **7 files / 69 tests pass**.
- `git diff --check`: clean.
