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
30 / 30 with 54 reviewed items, two more lessons, and a Domain 5 practice set (2026-10-27).

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

### Remaining Phase D work

- Deepen objectives that still have a single reviewed item, especially in Domains 1, 4, 6, and 7.
- Add mapped lessons for Domains 3, 4, 6, and 7; `workflow-design` remains the only planned lesson.
- Grow the bank by six more reviewed items to close the mock-preview shortfall without filler.
- Mock exam timer, auto-submit, and expiry as a separate versioned layer.
- A per-domain report and a defensible (non-invented) scaled-score policy only if an official source
  supports it.
- Data migration for compatible schema changes; incompatible data still requires backup + reset.

## Phase E — Progress and glossary

Status: implemented for local study progress (2026-10-27); glossary and settings shipped in Phase B.

- Safe localStorage persistence and schema versioning: `cfl.study.v1` envelope with content
  fingerprint and explicit corrupt/incompatible/unavailable states.
- Progress summaries based on actual saved activity, separated from reviewed-bank coverage.
- Searchable glossary and settings/reset, including local-data backup and two-step reset.

## Phase F — Quality

Status: unit/integration and build checks pass (2026-10-27); end-to-end and accessibility automation
remain outstanding.

- Typecheck, lint, unit/integration tests, production build.
- End-to-end tests for critical journeys (not started).
- Accessibility and responsive checks (manual axe run in Phase B only; not re-run for C2.4).
- Content coverage audit (`docs/CONTENT_COVERAGE_MATRIX.md`, 2026-10-27).

## Phase G — GitHub and Vercel

Status: not started for Phase C2.4. All changes are uncommitted in the working tree; no push or
deployment has been performed.

- Verify target repository and secure Git credentials.
- Commit and push tested work; no GitHub CLI.
- Verify Vercel integration or securely authenticated CLI deployment.
- Verify live URL and direct-route refreshes.
