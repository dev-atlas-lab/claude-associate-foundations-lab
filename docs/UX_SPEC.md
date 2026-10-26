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

## Phase B implementation notes

- Every route renders inside `AppShell`, including `*` (404) and unknown lesson ids.
- `/practice`, `/mock-exam`, `/review` and `/progress` are explicit "not implemented" states, not
  functional-looking mockups.
- Theme choice lives in both the topbar and `/settings`; both drive the same React context.
- Lesson pages add a sticky outline at ≥1200px and keep the reading column at 68ch.
- Exact tokens, component inventory and accessibility decisions are recorded in
  `docs/DESIGN_SYSTEM.md`.
