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

Status: C0 and C1 implemented (2026-10-26). C2 content authoring is the next content task.

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

- Rewrite the Context Window material for the Associate audience, or choose a Domain 2 lesson.
- Review the lesson against the verified objective and add original practice items.
- Validate content quality with the owner before scaling the pattern.

## Phase D — Assessment engine

- Single-choice and multiple-response scoring.
- Practice and exam modes.
- Timer, results, explanations, bookmarks, review.

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
