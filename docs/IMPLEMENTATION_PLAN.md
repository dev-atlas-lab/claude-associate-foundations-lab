# Implementation Plan

The coding agent should refine this plan after official exam-guide research.

## Phase A — Research and foundation

Status: implemented (2026-10-26). Exam Guide v1.0 was verified and the coverage matrix was created.
See `docs/EXAM_BLUEPRINT.md` and `docs/CONTENT_COVERAGE_MATRIX.md`.

- Verify official guide and objectives.
- Complete exam coverage matrix.
- Finalize product and UX decisions.
- Install and verify compatible dependencies.

## Phase B — Design system and app shell

Status: implemented (2026-10-26). See `docs/DESIGN_SYSTEM.md` and `docs/PROGRESS.md`.

- Responsive navigation and layout.
- Typography, spacing, color tokens, theme handling.
- Dashboard and curriculum navigation.

## Phase C — Content and visualization

Status: C0 and C1 implemented (2026-10-26). C2.1 assessment core implemented (2026-10-26).
C2.2a added the first reviewed Domain 2 bank. C2.2b added the Domain 2 lesson and completed the
reviewed Domain 2 bank. C2.3 expanded the bank to 24 items and added persistence, practice/review/
progress, and the mock preview (2026-10-27). C2.4 added Domain 5 and closed objective coverage at
30 / 30 with 54 reviewed items, two more lessons, and a Domain 5 practice set (2026-10-27). C2.5
published the four remaining whole-domain lessons, closed mapped-lesson coverage at 30 / 30, and
added eight depth items for 62 reviewed items total (2026-10-27). C2.6 added the browser/accessibility
regression audit, C2.7 added CI gates, and C2.8 added the separate timed simulation (2026-10-28).

### C0 — Official blueprint verification

- Read Exam Guide v1.0 (effective July 2026) and record verified facts, sources, and limitations.
- Create the coverage matrix and keep future guide revisions separate.

### C1 — Platform domain model

- Certification-neutral schemas for sources, verification, certification, blueprint, domains,
  objectives, lessons, sections, questions/choices, explanations, and content status.
- Cross-reference validation at content-pack load.
- Migrate the Context Window sample with an explicit unmapped exam status.
- Add single-choice and multiple-response rendering plus schema tests.

### C2 — First exam-mapped lesson

Status: completed by `evaluation-basics` in C2.2b (2026-10-26).

- Rewrite the Context Window material for the Associate audience, or choose a Domain 2 lesson.
- Review the lesson against the verified objective and add original practice items.
- Validate content quality with the owner before scaling the pattern.

## Phase D — Assessment engine

Status: C2.1 assessment core implemented (2026-10-26). See `docs/ASSESSMENT_ENGINE.md`.

### C2.1 — Reusable assessment core

- Certification-neutral definition and session model with explicit in-progress/submitted states.
- Pure start, answer, navigation, flag, and submit transitions with typed validation errors.
- Exact-set single-choice and multiple-response scoring, unanswered handling, and derived result data.
- Content-pack validation for assessment ids and question references.
- `/practice` runs one visibly unmapped sample assessment through the reusable runner.

### C2.2a — Reviewed Domain 2 question bank

- Six original, source-grounded items across three verified Domain 2 objectives, with both
  single-choice and multiple-response formats.
- Bank metadata wraps the existing question schema and is validated for objective, blueprint,
  certification, source, review-status, and uniqueness references.
- `/practice` runs the reviewed six-item set; the unmapped Context Window sample remains in its
  lesson.

### C2.2b — Domain 2 lesson and complete reviewed bank

- Published `evaluation-basics`, a curriculum lesson mapped to all six Domain 2 objectives.
- Added eight original items for human review, audience editing, format selection, and bias; the bank
  now has 14 items, with every Domain 2 objective represented by at least two items.
- Bias is limited to framing, evidence selection, unequal standards, and protected-characteristic
  assumptions supported by Claude's Constitution. It is not a comprehensive fairness evaluation.
- Added lesson-to-bank `relatedQuestionIds` references, validated by the content pack and rendered on
  the lesson page.
- `/practice` runs all 14 reviewed items; the Context Window sample remains unmapped and available
  through its own lesson.

### C2.3 — Practice workflow, persistence, and mock preview

Status: implemented (2026-10-27).

- Expanded the reviewed bank to 24 items across Domains 1, 2, 3, 4, 6, and 7; coverage is now
  15 / 30 objectives.
- Registry-driven practice sets with validated bank references, domain declarations, `?set=` deep
  links, resume, and an unknown-set state.
- Versioned `cfl.study.v1` persistence with a content fingerprint, corrupt/incompatible/unavailable
  handling, raw backup download, and a two-step reset.
- Derived review queue (incorrect, unanswered, flagged) with explicit resolution and navigation.
- Progress report that separates bank coverage from personal performance.
- Blueprint-weighted 24-of-60 mock-exam preview with an honest 36-item shortfall, no filler, no
  timer, and no scaled score.
- Route-level `React.lazy`/`Suspense` code splitting; the >500 kB chunk warning is resolved without
  suppression.

### C2.4 — Domain 5 and full objective coverage

Status: implemented (2026-10-27).

- Added 30 reviewed items: 8 for Domain 5 and 22 closing the previously uncovered objectives in
  Domains 1, 3, 4, 6, and 7. The bank is now 54 items across all 30 objectives.
- Added `configuration-basics` (Domain 5) and `prompt-structure` (Domain 1) as mapped lessons, each
  linking its reviewed practice items.
- Added the `domain-5-configuration-set` practice set and expanded the Domain 1, 3, 4, 6, and 7 sets.
  The mixed set derives its question list from the reviewed registry.
- Extracted `reviewedEntry` into a shared `bank-helpers.ts` factory so every bank file uses one
  validated review path.
- Fixed lesson practice labels to derive the domain from the objective mapping, and replaced
  hardcoded bank totals in the dashboard and progress pages with registry-derived values.

### C2.5 — Whole-domain lessons and question depth

Status: implemented (2026-10-27).

- Published `product-selection` (Domain 3), `workflow-design` (Domain 4),
  `governance-responsible-use` (Domain 6), and `troubleshooting-optimization` (Domain 7). Every
  official objective now has a mapped curriculum lesson.
- Added the official Anthropic Engineering source `Building effective agents` with an access note
  that separates its durable workflow guidance from its time-sensitive 2024 tooling details.
- Added eight original depth items, one for each objective that previously had a single reviewed
  item. The bank is now 62 items (32 single-choice, 30 multiple-response), and every objective has at
  least two items.
- Strengthened source traceability on existing decomposition, solution-design, checkpoint, and
  customer-assistant safeguard items without changing their IDs or answer keys.
- Emptied the planned-lessons registry and updated learner-facing counts and mock-preview copy to
  reflect 60 of 62 selected items with no shortfall, still without a timer or scaled score.

### C2.6 — Accessibility, end-to-end, and regression audit

Status: implemented (2026-10-28).

- Added a Chromium Playwright suite against the production preview: navigation and all 8 lessons,
  practice and exact-set scoring, persistence and storage recovery, review/progress derivation, theme
  persistence, responsive widths, and keyboard/focus behavior. **104 tests pass.**
- Added axe-core scans for 32 states in both themes plus the open mobile drawer: **65 scans, 0
  violations**, with no rules disabled. Manual checks cover landmarks, heading order, names, focus
  movement, skip link, drawer trap, reduced motion, and no color-only answer state.
- Fixed genuine defects: question-index focus, knowledge-check retry focus, reset-confirmation focus,
  review-resolution focus, a duplicate Practice landmark name, an invalid `role` on `<aside>`, and
  low-contrast review option keys.
- Isolated the test gates so Vitest no longer collects Playwright files and added E2E typechecking and
  lint configuration.
- No timer, content, scoring, answer-key, fingerprint, or persistence-format change was made.

### C2.7 - CI quality gates and release readiness

Status: implemented and verified (2026-10-28); the first GitHub Actions run passed.

- Added `.github/workflows/ci.yml` for pull requests and pushes to `main`: Node 22 from `.nvmrc`,
  npm caching, `npm ci`, typecheck, lint, unit/integration tests, production build, Chromium
  installation with `--with-deps`, and the existing Playwright suite against the production preview.
- Playwright uploads `test-results/` and `playwright-report/` on failure; CI adds the HTML reporter
  while local runs keep the list reporter.
- Workflow permissions are limited to `contents: read`; there are no secrets, deployment steps,
  browser matrix, or extra third-party actions.
- Locally verified: `npm ci`, typecheck, lint, **145** unit/integration tests, the production build,
  **104** Playwright tests in both normal and `CI=true` modes, and `git diff --check`.
- GitHub Actions run `40611368468` on `main` passed every step, including E2E/accessibility; the
  failure-artifact upload was skipped as expected on a green run.
- Not verified: Firefox/WebKit, manual screen-reader testing, and Vercel deployment.

### C2.8 - Timed mock exam

Status: implemented, verified locally, committed as `8631d55`, and pushed to `origin/main`
(2026-10-28).

- Added `/mock-exam/timed` as a distinct 60-question / 120-minute simulation while preserving the
  untimed `/mock-exam` preview unchanged.
- Persisted an authoritative `deadlineAt` in a versioned single-slot envelope at
  `cfl.timed-exam.v1`, separate from `cfl.study.v1`. Reloads resume the same attempt and deadline;
  expiry auto-submits even after timer throttling, and the retained result is immutable.
- Reused the shared assessment primitives for exact-set scoring, answer changes, flags, navigation,
  and result derivation. Manual and `time-expired` submissions are distinguished; no partial credit
  or scaled score was added.
- Added deterministic attempt-id-seeded selection over the blueprint-weighted allocation, an exact
  shortfall-disabled start state, corrupt/incompatible/content-mismatch recovery, and explicit discard
  that never touches Practice data.
- Added clock-controlled E2E coverage, corrupt/unavailable/quota states, keyboard and warning
  announcement checks, axe scans for the intro/question/result, and 390/768/1440 responsive checks.
- Verified locally: typecheck, lint, **177** unit/integration tests across **23** files,
  **116** Playwright tests across **8** files, the production build, and **git diff --check**.

### C2.9 - Content and assessment audit

Status: completed locally (2026-10-28); corrections are unstaged for human review. One timed-allocation
expectation is accepted as a documented deviation. No commit, push, branch change, deployment, or
destructive cleanup was performed.

- Audited all 62 bank items, 8 lessons, 15 glossary entries, 27 sources, all lesson
  `relatedQuestionIds`, the seven domain practice sets, the mixed set, and timed-exam integrity.
- Results: 60 question passes + 2 minor fixes; 6 lesson passes + 2 major fixes; 13 glossary passes +
  2 minor fixes; 26 source passes + 1 minor fix; 3 domain-set passes + 4 minor fixes.
- Corrected project-memory wording, stale domain practice sets, and the `context-rot` and
  `hallucination` glossary definitions. Added regression tests for domain-set alignment, exact
  weights, and the timed allocation.
- Full matrix and evidence: `docs/CONTENT_AUDIT_2026-10-28.md`.
- Timed allocation decision: the brief's `8 / 13 / 7 / 10 / 7 / 9 / 6` is impossible because Domain 6
  has only 8 items. The selector fills `8 / 13 / 8 / 10 / 7 / 8 / 6` with no duplicate or filler. The
  project owner accepted this actual allocation on 2026-10-28 as a documented deviation; no code change
  was made and the original target is not claimed.
- Verified locally: targeted **9 files / 71 tests**, typecheck, lint, and `git diff --check`. Full
  `npm test`, Playwright E2E, and the production build remain delegated to CI after a push.

### C2.10 - Learning effectiveness instrumentation

Status: implemented, verified locally, committed as `38b59b6`, and verified in GitHub Actions CI run
`40797871265` (2026-10-29).

- **C2.10-1:** Added curriculum lookup helpers in `src/content/index.ts` and pure read-only
  breakdown, review, and progress selectors in `src/features/progress/selectors.ts`.
- **C2.10-2:** Linked lesson practice CTAs directly to `/practice?set=<domainSetId>` and added
  local activity status badges (`Not started`, `In progress`, `Completed`) on `/practice`.
- **C2.10-3:** Added post-submission domain/objective breakdown tables and question-level
  Domain/Objective/Lesson/Practice/Sources context in `AssessmentRunner`, `TimedExamResultView`,
  and `QuestionPanel`.
- **C2.10-4:** Enriched `ReviewPage` with Domain/Objective metadata, official Sources, Lesson and
  Domain Practice remediation links, repeat-miss indicators, and read-time visibility for submitted
  timed-exam mistakes/flags.
- **C2.10-5:** Upgraded `ProgressPage` with unique bank exposure (`X / 62`), First-seen vs. Latest
  vs. Cumulative accuracy, a 30-objective coverage & performance matrix, and a chronological
  submitted attempt history table.

### C2.11 - Focused "Practice Open Review Items" runner

Status: implemented, verified locally, committed as `3e90c92`, and verified in GitHub Actions CI run
`40800441329` (2026-10-29).

- Added `buildReviewPracticeSet` and `findCorrectlyAnsweredStudyReviewItems` in
  `src/features/progress/selectors.ts` to build a deduplicated, filter-aware in-memory practice set
  over open review items without changing `cfl.study.v1`, `cfl.timed-exam.v1`, or
  `contentFingerprint`.
- Added `/review?mode=practice` (`ReviewPracticeView`) on `ReviewPage.tsx` so learners can re-test
  their open mistakes interactively without seeing the answer key first, and explicitly resolve the
  `cfl.study.v1` items they answered correctly after submission.

### C2.12 - Domain 6 9th reviewed item & Associate-refined Context Window lesson

Status: implemented, verified locally, committed as `6778ece` / `c1c07d6`, and verified in GitHub
Actions CI run `40802276918` (2026-10-29).

- Added `governance-privacy-third-party-connector` (Domain 6, `governance-data-privacy`), bringing
  the reviewed bank to **63** items (33 single-choice, 30 multiple-response) and **9** Domain 6
  items so the 60-item timed exam and mock preview fill the exact `8 / 13 / 7 / 10 / 7 / 9 / 6`
  blueprint allocation.
- Refined `context-window` (`src/content/certifications/claude-associate-foundations/lessons/context-window.ts`)
  for the Associate audience (connecting working memory and token budgeting to Projects, chat
  history, file uploads, and fresh-chat handoffs) while keeping it explicitly unmapped (`kind:
  "sample"`).

### C2.13 - Explicit compatible study data migration

Status: implemented, verified locally, committed as `b1fadea`, and verified in GitHub Actions CI run
`40803406347` (2026-10-29).

- Added `inspectCompatibleStudyMigration` in `src/persistence/storage.ts` and
  `migrateCompatibleStudyData` in `src/persistence/study-store.ts`.
- Updated `StudyStorageNotice.tsx` so learners with a stale `contentFingerprint` (schema v1) can
  explicitly migrate compatible attempts and review resolutions to the current fingerprint while
  keeping corrupt or schema-incompatible payloads quarantined behind backup + reset.

### C2.14 - Deterministic question order shuffling & coverage matrix sync

Status: implemented, verified locally, committed as `00d1cce`, and verified in GitHub Actions CI run
`40804900181` (2026-10-29).

- Added `shuffleQuestionIds(questionIds, seed)` in `src/domain/mock-exam.ts` and wired `Start
  shuffled` and `Shuffle & retry` into `AssessmentRunner` and `PersistedAssessment`, persisting the
  shuffled `questionIds` snapshot on `StudyAttempt` across browser reloads while preserving canonical
  ordering for `Start assessment` and `New attempt`.
- Synchronized `docs/CONTENT_COVERAGE_MATRIX.md` and `docs/UX_SPEC.md` with C2.11–C2.14.

### C2.15 - Actionable study desk on Dashboard (`/`)

Status: implemented and verified locally (2026-10-29).

- Upgraded `src/pages/DashboardPage.tsx` to read both `useStudyState()` and `useTimedExamState()`,
  surface a `Continue active study` section when in-progress attempts or open review items exist, and
  enrich the 7 blueprint domain rows on `/` with per-domain bank counts, personal exposure, and
  direct links to each domain's mapped Lesson and Domain Practice Set.

### C2.16 - High-weight domain question bank depth expansion

Status: implemented and verified locally (2026-10-29).

- Added four reviewed, source-backed items in
  `src/content/certifications/claude-associate-foundations/question-bank-depth.ts`:
  - `prompting-iterate-rubric-calibration` (Domain 1 · `prompting-iterate`, single-choice)
  - `workflow-solution-handoff-controls` (Domain 4 · `workflow-solution-design`, multiple-response)
  - `governance-policy-exception-escalation` (Domain 6 · `governance-policies`, single-choice)
  - `optimize-workflow-cost-latency-controls` (Domain 7 · `optimize-workflows`, multiple-response)
- The reviewed bank now totals **67** items (`35` single-choice, `32` multiple-response) with per-domain
  availability **`9 / 14 / 8 / 11 / 8 / 10 / 7`**, so every official domain has at least one spare
  item beyond its `8 / 13 / 7 / 10 / 7 / 9 / 6` 60-item timed simulation allocation.

### Remaining Phase D work

- Treat 62 items as a starting depth, not a finished bank. Add items only for distinct decisions in
  high-weight domains; do not inflate counts.
- Rewrite the Context Window sample for the Associate audience, then decide whether it can be
  verified against Domain 3's `context-memory-management` objective. Keep it unmapped until then.
- A per-domain report and a defensible (non-invented) scaled-score policy only if an official source
  supports it.
- Data migration for compatible schema changes; incompatible data still requires backup + reset.
- Device-clock tampering and cross-browser timer behavior remain unverified; the frontend-only MVP
  has no server clock.

## Phase E — Progress and glossary

Status: implemented for local study progress (2026-10-27); glossary and settings shipped in Phase B.

- Safe localStorage persistence and schema versioning: `cfl.study.v1` envelope with content
  fingerprint and explicit corrupt/incompatible/unavailable states.
- Progress summaries based on actual saved activity, separated from reviewed-bank coverage.
- Searchable glossary and settings/reset, including local-data backup and two-step reset.

## Phase F — Quality

Status: complete for Phase C2.9 (2026-10-28). C2.8's typecheck, lint, 177 unit/integration tests, 116
Playwright tests, production build, and 71 axe scans passed. C2.9 added targeted content tests,
typecheck, lint, and diff checks; full CI for the audit changes is pending a push. A GitHub Actions
workflow runs the same gates on pull requests and pushes to `main`, and its first `main` run passed.
Firefox/WebKit, manual screen-reader testing, device-clock tampering, and deployment verification
remain outstanding.

- Typecheck, lint, unit/integration tests, production build.
- End-to-end tests for critical journeys (`tests/e2e/`, run with `npm run test:e2e`).
- Accessibility and responsive automation via axe-core and Playwright at 390 / 768 / 1440 px.
- CI workflow (`.github/workflows/ci.yml`) with locked dependency install, production preview E2E,
  least-privilege permissions, and failure artifacts.
- Content coverage audit (`docs/CONTENT_COVERAGE_MATRIX.md`) and full content/assessment audit
  (`docs/CONTENT_AUDIT_2026-10-28.md`, 2026-10-28).

## Phase G — GitHub and Vercel

Status: in progress. Tested work through C2.7 was committed as `50efba5` and pushed to `origin/main`
on 2026-10-28, and the first GitHub Actions run passed. Phase C2.8 was committed as `8631d55` and
pushed. Phase C2.9 is implemented and verified locally but remains uncommitted for review. Vercel is
not connected and no deployment has been performed.

- [x] Verify target repository and secure Git credentials.
- [x] Commit and push tested work; no GitHub CLI.
- [ ] Verify Vercel integration or securely authenticated CLI deployment.
- [ ] Verify live URL and direct-route refreshes.
