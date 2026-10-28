# UX Specification

## Visual direction

Premium editorial learning product: clear typography, restrained color, generous spacing, purposeful visuals, and strong readability. Avoid generic AI landing-page styling and dashboard clutter.

## Core navigation

- Dashboard
- Learn
- Practice
- Mock exam
- Review mistakes
- Progress
- Glossary
- Settings

## Core learning flow

Dashboard → choose domain → lesson → explore visualization → answer English quiz → read feedback → continue or review.

## Assessment flow

Choose mode → show clear rules and progress → answer questions → submit → show score and domain performance → review answers and explanations.

Do not reveal answers before submission in exam mode.

## Accessibility

- Semantic HTML and labels.
- Full keyboard navigation.
- Visible focus states.
- Adequate contrast.
- Reduced-motion support.
- Do not communicate correctness by color alone.
- Mobile layouts must keep question text and answer controls usable.

## States

Design meaningful empty, completed, error, and reset-confirmation states. Do not fabricate learner statistics or progress.

## Implementation notes

- Every route renders inside `AppShell`, including `*` (404) and unknown lesson ids.
- `/practice` is registry-driven: eight reviewed sets (seven domain sets plus one mixed set) support
  `?set=` deep links, resume an in-progress attempt, and persist attempts locally. It is practice,
  not an official exam form.
- `/mock-exam` runs a blueprint-weighted 60-of-60 preview drawn from 62 reviewed items, with no
  shortfall, no timer, and no scaled score. `/review` derives incorrect, unanswered, and flagged items
  from submitted attempts and resolves them only on explicit request. `/progress` separates
  reviewed-bank coverage from personal performance.
- `/learn/evaluation-basics` is one of seven exam-mapped curriculum lessons. The lesson set covers all
  seven domains, links to reviewed bank questions through validated `relatedQuestionIds`, and provides
  a direct route to `/practice`.
- The assessment shows English questions and Vietnamese feedback only after submission, confirms
  submission with the unanswered count, and keeps answer/flag controls locked afterwards.
- The unmapped Context Window sample remains available through its lesson knowledge check.
- Theme choice lives in both the topbar and `/settings`; both drive the same React context.
- Lesson pages add a sticky outline at ≥1200px and keep the reading column at 68ch.
- Exact tokens, component inventory and accessibility decisions are recorded in
  `docs/DESIGN_SYSTEM.md`; assessment decisions are recorded in `docs/ASSESSMENT_ENGINE.md`.
