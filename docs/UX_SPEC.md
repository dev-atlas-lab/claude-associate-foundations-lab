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

Two mock-exam surfaces are deliberate:

- `/mock-exam` is an **untimed preview**. It shows the 60-item blueprint form and its allocation, but
  it must never be described as a timed simulation.
- `/mock-exam/timed` is a **60-question / 120-minute simulation** with a saved deadline, auto-submit,
  reload recovery, a retained result, and post-submission review. It is still original practice
  content, not an official exam form or score.

### Timed-exam flow

Start screen → read rules and blueprint allocation → start → answer/flag/navigate under a visible
countdown → submit manually with confirmation, or submit automatically at expiry → result summary
→ review each question and explanation → start a new attempt only after explicitly discarding the
saved result.

The start control is disabled when fewer than 60 reviewed items are available, with the exact
shortfall and a statement that no filler or duplicate will be used.

### Timer and submission states

- Normal: remaining time is displayed as hours/minutes/seconds, with the local end time.
- Warning: the last 10 minutes add a text warning; the last 5 minutes use the critical treatment.
  Warnings are announced only at the 10-, 5-, and 1-minute boundaries, never every second.
- Expired: the label reads "Time is up"; the attempt submits automatically and the result is marked
  "Automatic expiry" in text, not color alone.
- Manual submission is marked "Manual submission". A late manual click at or after the deadline is
  recorded as expiry.
- Leaving the page does not pause the timer. Returning before the deadline resumes the same attempt
  and question order; returning after it submits immediately.
- The result shows the raw percentage and counts. It never shows a scaled 100-1,000 score, a pass
  threshold, or a readiness prediction.

### Recovery states

- Corrupt or incompatible saved data: explain what failed, show stored schema/fingerprint where
  available, offer a raw JSON backup, and require a two-step explicit discard. Do not resume or score
  it, and block a new attempt until recovery.
- Missing questions or changed content after load: show the content-mismatch state and require
  discard.
- Storage unavailable or a write failure: keep the attempt usable in the current tab, clearly warn
  that reload will lose it, and never claim that a failed write was saved.

## Accessibility

- Semantic HTML and labels.
- Full keyboard navigation.
- Visible focus states.
- Adequate contrast.
- Reduced-motion support.
- Do not communicate correctness by color alone.
- Mobile layouts must keep question text and answer controls usable.
- The timed countdown is a silent `role="timer"`; only the 10-, 5-, and 1-minute warnings are
  announced through a polite live region. Expiry and submission reasons are also stated in text.
- Keyboard focus moves to the question heading on navigation and to confirmation/recovery headings
  when those states open; the active question and answer state are exposed as text.

## States

Design meaningful empty, completed, error, and reset-confirmation states. Do not fabricate learner statistics or progress.

## Implementation notes

- Every route renders inside `AppShell`, including `*` (404) and unknown lesson ids.
- `/practice` is registry-driven: eight reviewed sets (seven domain sets plus one mixed set) support
  `?set=` deep links, resume an in-progress attempt, support deterministic shuffled question
  ordering (`Start shuffled` and `Shuffle & retry`), and persist attempts locally. It is practice,
  not an official exam form.
- `/mock-exam` runs a blueprint-weighted 60-of-60 preview drawn from 63 reviewed items, with no
  shortfall, no timer, and no scaled score. `/mock-exam/timed` is the distinct deadline-enforced
  simulation; it stores one attempt at `cfl.timed-exam.v1`, resumes the original question order and
  deadline after reload, auto-submits at expiry, and retains an immutable raw result.
  `/review` derives incorrect, unanswered, and flagged items from submitted attempts, supports an
  in-memory focused practice mode (`/review?mode=practice`), and resolves items only on explicit
  request. `/progress` separates reviewed-bank coverage from personal performance.
- The timed result shows a raw percentage only. It does not convert to the official 100-1,000 scale,
  claim a pass/fail outcome, or predict readiness. Discarding timed-exam data never touches
  `cfl.study.v1`.
- `/learn/evaluation-basics` is one of seven exam-mapped curriculum lessons. The lesson set covers all
  seven domains, links to reviewed bank questions through validated `relatedQuestionIds`, and provides
  a direct route to `/practice`.
- The assessment shows English questions and Vietnamese feedback only after submission, confirms
  submission with the unanswered count, and keeps answer/flag controls locked afterwards.
- The unmapped Context Window sample remains available through its lesson knowledge check.
- Theme choice lives in both the topbar and `/settings`; both drive the same React context.
- Lesson pages add a sticky outline at ≥1200px and keep the reading column at 68ch.
- The timed exam is verified at 390, 768, and 1440 px. Its question navigator moves below the
  question on narrow screens, the timer remains readable, and no horizontal overflow is allowed.
- Exact tokens, component inventory and accessibility decisions are recorded in
  `docs/DESIGN_SYSTEM.md`; assessment decisions are recorded in `docs/ASSESSMENT_ENGINE.md`.
