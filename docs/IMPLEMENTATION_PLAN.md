# Implementation Plan

The coding agent should refine this plan after official exam-guide research.

## Phase A — Research and foundation

- Verify official guide and objectives.
- Complete exam coverage matrix.
- Finalize product and UX decisions.
- Install and verify compatible dependencies.

## Phase B — Design system and app shell

- Responsive navigation and layout.
- Typography, spacing, color tokens, theme handling.
- Dashboard and curriculum navigation.

## Phase C — Content and visualization

- Content/question schemas.
- First vertical slice: one complete domain lesson, one interactive visualization, one English quiz, and review feedback.
- Validate content quality with the owner before scaling patterns.

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
