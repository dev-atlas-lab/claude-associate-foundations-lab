# Claude Foundations Lab

A frontend-only interactive learning platform for the **Claude Certified Associate – Foundations (CCAO-F)** certification.

The product pairs Vietnamese explanations with English assessments: lessons, interactive visualizations, practice questions, a blueprint-weighted mock-exam preview, and a derived review queue. No backend and no API key are required; theme, attempts, and review state are stored locally in the browser.

## Current status

Phases B, C0, C1, C2.1, C2.2a, C2.2b and C2.3 are implemented on top of the validated scaffold.

- Design tokens, Dark / Light / System themes with localStorage persistence, responsive sidebar and
  mobile drawer, skip link, focus management, and reduced-motion support.
- All main routes, including the lesson route and a real 404, render deliberate states inside one
  shell.
- Official CCAO-F Exam Guide v1.0 (effective July 2026) is verified: 60 items, 120 minutes, seven
  weighted domains, 30 objectives, and a 720 passing score on a 100–1,000 scale. See
  `docs/EXAM_BLUEPRINT.md` and `docs/CONTENT_COVERAGE_MATRIX.md`.
- A certification-neutral domain model in `src/domain/` validates sources, verification metadata,
  blueprints, domains, objectives, lessons, sections, single/multiple-response questions, answer
  explanations, and content status. `src/content/` holds the CCAO-F-specific data.
- One representative lesson (`/learn/context-window`) covers the full reading pattern: Vietnamese
  explanation, English technical terms, an interactive budget diagram, a worked scenario, and an
  English knowledge check with Vietnamese explanations for every option. It is explicitly **not**
  mapped to an official objective yet.
- The first exam-mapped curriculum lesson, `/learn/evaluation-basics`, teaches all six Domain 2
  objectives: accuracy/completeness, hallucination/inconsistency and bias detection, fact-checking,
  human-review escalation, audience editing, and output-format selection. It links to reviewed bank
  questions and is explicit about the limits of its bias evidence.
- A deterministic, certification-neutral assessment core in `src/domain/assessment.ts` supports
  single-choice and exact-set multiple-response scoring, answer changes, navigation, flags, explicit
  submission confirmation, review navigation, and idempotent submission. Scores are derived from
  submitted answers rather than stored in mutable state.
- A reviewed, source-grounded bank of **24 original items** across Domains 1, 2, 3, 4, 6 and 7
  (13 single-choice, 11 multiple-response). Bank metadata is validated against the blueprint,
  certification, sources, and review status; no official questions are copied. See
  `src/domain/question-bank.ts`.
- Practice (`/practice`) is registry-driven: seven sets (six domain sets plus one mixed set) support
  `?set=` deep links, resume an in-progress attempt, and save progress locally. English questions and
  Vietnamese explanations appear after submission. There is no timer and no official form.
- Versioned local persistence (`cfl.study.v1`) with a content fingerprint, corrupt/incompatible/
  unavailable handling, raw backup download, and a two-step reset. Submitted attempts are immutable.
- The Review page derives incorrect, unanswered, and flagged items from submitted attempts and
  resolves them only through an explicit "Mark reviewed" action.
- Progress separates reviewed-bank coverage from personal performance and shows a real zero-activity
  state instead of a fabricated score.
- The Mock exam page runs a blueprint-weighted **24-of-60 preview**, reports the 36-item shortfall,
  and adds no filler, duplicates, timer, or scaled score.
- Overall reviewed coverage is **15 / 30** objectives; Domain 2 is the only domain with an
  exam-mapped lesson, and Domain 5 has no reviewed items yet.
- The Context Window sample lesson and its unmapped knowledge check remain available; the sample
  assessment definition is still in the pack but is no longer the `/practice` surface.
- GitHub repository exists at <https://github.com/dev-atlas-lab/claude-associate-foundations-lab> on `main`.
- No Vercel project has been connected yet.

Quality gates currently pass: typecheck, lint, 123 tests across 18 files, and production build. Routes
are code-split with `React.lazy`; the largest JS chunks are 339.94 kB (107.78 kB gzip) and 227.81 kB
(64.11 kB gzip), with no Vite chunk-size warning. An axe-core run on the dashboard, lesson, mock-exam,
and glossary routes in both themes reports 0 violations; the new study surfaces still need a
dedicated browser audit. See `docs/PROGRESS.md` for the detailed log, `docs/ASSESSMENT_ENGINE.md` for
assessment decisions, and `docs/DESIGN_SYSTEM.md` for the design decisions.

Brand source files live in `brand/`; the runtime favicon and app-icon copies are in `public/brand/`.

## Requirements

- Node.js `>=20.19.0` (Node 22 LTS is the tested baseline; `.nvmrc` pins major 22)
- npm 10+
- Git

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

End-to-end tests are scaffolded but not written yet: `npm run test:e2e`.

## Tech stack

- React 19 + TypeScript 5.9 (strict) + Vite 6
- React Router 7 (`createBrowserRouter`; SPA rewrites in `vercel.json`)
- Zod 4 for runtime validation of the platform domain model and content pack
- Vitest 4 + React Testing Library
- Playwright for end-to-end tests (config not added yet)
- Vercel for static frontend hosting

### Dependency policy

Version ranges are pinned to a tested, mutually compatible set instead of `latest`, so a fresh clone cannot silently pull a breaking major.

The current set targets the Node 22.11 runtime available in this workspace. The newest majors (Vite 8, Vitest 5, ESLint 10, TypeScript 7) require Node `>=22.12`/`^22.13` and are therefore intentionally deferred; revisiting them is a follow-up task once Node is upgraded to 24 LTS. `npm audit` reports 0 vulnerabilities for the pinned set.

## Content and language policy

- Lesson explanations: Vietnamese, keeping important English terminology.
- Question stems, answer choices, and exam instructions: English.
- Feedback and answer explanations: Vietnamese, retaining technical terms.
- Practice questions are original study material and are never presented as official exam questions.

## Deployment (Vercel)

1. Push to `main` (the SPA rewrite in `vercel.json` keeps deep links working).
2. In the Vercel dashboard, **Add New → Project → Import Git Repository** and select `claude-associate-foundations-lab`.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`, install command `npm ci`.
4. Deploy, then verify both `/` and a deep route such as `/learn` after a hard refresh.

No Vercel project ID or deployment URL is committed to this repository.

## Documentation

- `docs/PRODUCT_SPEC.md` — product definition and non-goals
- `docs/EXAM_BLUEPRINT.md` — verified exam facts, sources, limitations, and version warning
- `docs/CONTENT_COVERAGE_MATRIX.md` — all 30 objectives, current/planned content, coverage gaps
- `docs/CONTENT_GUIDELINES.md` — language, sourcing, and question-quality rules
- `docs/UX_SPEC.md` — visual direction, navigation, accessibility
- `docs/DESIGN_SYSTEM.md` — implemented tokens, components, theme model, accessibility decisions
- `docs/ASSESSMENT_ENGINE.md` — assessment model, state transitions, scoring, UI, and non-goals
- `docs/IMPLEMENTATION_PLAN.md` — phased delivery plan
- `docs/REPOSITORY_SETUP.md` — GitHub organization/repository state and manual steps
- `docs/PROGRESS.md` — phase log

## Security

Never commit tokens, credentials, or `.env` files. `.gitignore` excludes `.env`, `.env.*` (except `.env.example`), build output, dependencies, and test artifacts.
