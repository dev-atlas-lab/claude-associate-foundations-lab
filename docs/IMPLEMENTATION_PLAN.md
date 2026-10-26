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
reviewed Domain 2 bank (2026-10-26).

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

### Remaining Phase D work

- Expand the reviewed bank beyond Domain 2, starting with the highest-weight uncovered domains.
- Practice mode with domain/mixed set selection, persistence, and a saved review queue.
- Mock exam format, timer, auto-submit, and result summary.
- Saved attempts, review queue, and domain breakdown.
- Persistence and migrations.

## Phase E — Progress and glossary

- Safe localStorage persistence and schema versioning.
- Progress summaries based on actual saved activity.
- Searchable glossary and settings/reset.

## Phase F — Quality

- Typecheck, lint, unit/integration tests, production build.
- End-to-end tests for critical journeys.
- Accessibility and responsive checks.
- Content coverage audit.

## Phase G — GitHub and Vercel

- Verify target repository and secure Git credentials.
- Commit and push tested work; no GitHub CLI.
- Verify Vercel integration or securely authenticated CLI deployment.
- Verify live URL and direct-route refreshes.
