# Assessment feature

Question data and scoring logic stay outside React.

Implemented in this folder:

- `components/AssessmentRunner.tsx` — start, answer, navigate, flag, confirm, submit, and review UI.

Reusable core:

- `src/domain/assessment.ts` — assessment/session types, validation, pure transitions, exact-set
  scoring, and derived results.
- `src/domain/question-bank.ts` — reviewed bank metadata wrapped around the existing question schema.
- `src/domain/content-pack.ts` — cross-reference validation for assessment, question, objective, and
  source ids.
- `src/content/.../assessments.ts` — certification-specific definitions.
- `src/content/.../question-bank.ts` — reviewed Domain 2 items with verified objective mappings.

The runnable reviewed definition is `domain-2-output-validation-set` (14 original items across all
six Domain 2 objectives). The `context-window-sample` definition remains deliberately unmapped to an
official objective and is surfaced through its lesson rather than `/practice`.

Still deferred:

- `storage.ts` — versioned local persistence.
- Practice-mode set selection, filters, attempt history, and review queue.
- Timer, auto-submit, full practice sets, mock exam, and per-domain reporting.

See `docs/ASSESSMENT_ENGINE.md`.
