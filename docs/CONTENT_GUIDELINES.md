# Content Guidelines

## Language policy

- Explanations and lesson prose: Vietnamese.
- Keep meaningful English terms unchanged: e.g. Prompt, Context Window, hallucination, evaluation, workflow, model selection.
- Question stem, answer choices, and exam instructions: English.
- Feedback and explanations after answering: Vietnamese, retaining important English terminology.

## Recommended lesson structure

1. Learning objectives.
2. Intuition and analogy.
3. Core explanation.
4. How it works / mental model.
5. Interactive visual.
6. Practical scenario.
7. Limitations and risks.
8. Common misconceptions and exam traps.
9. Summary.
10. English quiz.
11. Review explanation.

Use this structure flexibly; do not force irrelevant sections into every lesson.

## Accuracy and sourcing

- Map every published **curriculum** lesson to a verified objective in the matching blueprint version.
- Design samples must be marked `kind: "sample"` and `examMapping.status: "unmapped"`. Never invent
  an objective mapping just to satisfy a schema.
- Prefer official Anthropic sources for Claude product behavior and certification scope.
- Cite sources near claims in content data or lesson references. Every source id must resolve in the
  content pack; every source record states what it supports and when it was accessed. Lessons that
  link reviewed bank questions must use `relatedQuestionIds`, and every reference must resolve.
- Keep general Claude documentation separate from exam-guide evidence. Product docs support technical
  explanations; only the official exam guide and program pages support exam-scope, format, weight, or
  scoring claims.
- Do not stretch a source beyond its claim level. For example, Claude's Constitution supports
  balanced framing and equal treatment, but it is not a comprehensive fairness or bias evaluation
  methodology. Bias content must state that limitation.
- Every certification, blueprint, and lesson carries explicit verification metadata: status, checked
  date, note, and source ids. Published content requires `verification.status: "verified"`.
- Distinguish facts, examples, and recommendations.
- Never claim original questions are official questions.
- Do not copy restricted or leaked exam content, including the guide's sample items.
- Re-check time-sensitive product details and the guide version during curriculum research.

## Question quality

Questions should assess understanding, trade-offs, and scenario judgment—not only definitions.

Every question needs:
- Stable id.
- Question type (`single-choice` or `multiple-response`).
- English stem and choices.
- A correct-answer key whose ids exist and whose count matches the type.
- Vietnamese explanation for the correct answer.
- Vietnamese rationale for every choice, including distractors.
- Source references for the claim or scenario.

Per-question objective mapping and review metadata now live in a `QuestionBankEntry`, which wraps the
existing question schema instead of duplicating it. Bank entries must map to at least one verified
objective; unmapped design samples stay inside a lesson. Difficulty and tags are still not stored
because no reviewed consumer for them exists yet.

A question-bank item is not reviewed merely because its schema parses. It must have:
- a verified objective mapping in the matching blueprint version;
- a verification record that includes every question-level source;
- `contentStatus: "published"` only when the review is verified;
- original wording and, when a sub-skill is only partly supported by sources, an explicit statement
  of the limitation. The Domain 2 bias items are the current example: they assess framing and equal
  treatment, not a full fairness audit.

Avoid ambiguous wording, trick questions with multiple defensible answers, and unsupported claims.

## Authoring lessons and depth passes

The Domain 5, Domain 3/4/6/7 lesson, and coverage-depth work established patterns that later content
should follow:

- Use the shared `reviewedEntry(question, objectiveId, sourceIds, checkedAt)` factory from
  `bank-helpers.ts`. It is the single validated place that attaches review metadata, so a new bank
  cannot silently skip the verification contract.
- Keep one bank file per domain or per small authoring batch, and spread the arrays into
  `reviewedQuestionBank` in `question-bank.ts`. The registry stays the only question list.
- Prefer one well-structured lesson per domain that teaches all of that domain's objectives, rather
  than one thin lesson per objective. Map a lesson only to objectives it actually teaches.
- Keep lesson order append-only. New lessons take the next order number; do not renumber published
  lessons or change their routes.
- Give every curriculum lesson a useful knowledge check, a worked scenario, key terms, and a
  `relatedQuestionIds` list that resolves to reviewed bank items. Use the existing lesson schema; do
  not introduce a parallel content model.
- Write one single-choice and one multiple-response item per objective where the sources support it,
  so exact-set scoring is exercised on real content rather than only in test fixtures.
- Add a second item to an objective only when it assesses a meaningfully different decision. Do not
  add near-duplicates or inflate counts to make coverage look complete.
- State the required selection count in multiple-response stems, for example `Select three.` The
  schema enforces the key size; the stem must tell the learner the same thing.
- Describe model choice as capability tiers and selection approaches (efficiency-first vs
  capability-first) instead of freezing current model names, prices, or limits. Cite the official
  models documentation for the trade-off itself.
- Use Anthropic's `Building effective agents` for durable workflow concepts (predefined workflows vs
  agents, prompt chaining, routing, evaluator-optimizer, human checkpoints, measurement). Do not
  repeat its December 2024 tooling recommendations as if they were current; record that limitation.
- Treat the Help Center pages for projects, connectors, and research as JavaScript-rendered. Direct
  fetches may return only navigation chrome, so record the access note and avoid quoting exact menu
  labels that were not actually read.
- Keep dates honest: new review records use the date the sources were actually opened, and a bank
  may legitimately contain more than one `checkedAt` value.
- Do not count a planned lesson as published, and do not present lesson coverage as proof of exam
  readiness. Coverage means reviewed content exists, not that a domain is exhausted.
