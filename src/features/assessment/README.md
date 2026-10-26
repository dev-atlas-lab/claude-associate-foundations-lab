# Assessment feature

Keep question data and scoring logic separate from React components.

Suggested future structure:
- `schema.ts` — question schema and validation.
- `types.ts` — question, attempt, and result types.
- `scoring.ts` — single-choice and multiple-response scoring.
- `question-bank/` — original questions tagged by verified objective.
- `storage.ts` — versioned local persistence.

Every question needs an answer key, explanation, distractor rationale, and objective/source mapping.
