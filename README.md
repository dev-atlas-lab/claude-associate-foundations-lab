# Claude Foundations Lab

A frontend-only interactive learning platform for the **Claude Certified Associate – Foundations (CCAO-F)** certification.

The product pairs Vietnamese explanations with English assessments: lessons, interactive visualizations, practice questions, a blueprint-weighted mock-exam preview, a deadline-enforced timed simulation, and a derived review queue. No backend and no API key are required; theme, attempts, and review state are stored locally in the browser.

## Current status

Phases B, C0, C1, C2.1, C2.2a, C2.2b, C2.3, C2.4, C2.5, C2.6, C2.7 and C2.8 are implemented on top of the
validated scaffold.

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
- Seven mapped curriculum lessons now cover every exam domain: `/learn/evaluation-basics` (Domain 2),
  `/learn/prompt-structure` (Domain 1), `/learn/configuration-basics` (Domain 5),
  `/learn/product-selection` (Domain 3), `/learn/workflow-design` (Domain 4),
  `/learn/governance-responsible-use` (Domain 6), and `/learn/troubleshooting-optimization` (Domain 7).
  Each teaches all objectives in its domain, links to reviewed bank items, and includes an English
  knowledge check with Vietnamese explanations.
- A deterministic, certification-neutral assessment core in `src/domain/assessment.ts` supports
  single-choice and exact-set multiple-response scoring, answer changes, navigation, flags, explicit
  submission confirmation, review navigation, and idempotent submission. Scores are derived from
  submitted answers rather than stored in mutable state.
- A reviewed, source-grounded bank of **62 original items** across all seven domains (32
  single-choice, 30 multiple-response), covering all 30 official objectives with at least two items
  each. Bank metadata is validated against the blueprint, certification, sources, and review status;
  no official questions are copied. See `src/domain/question-bank.ts`.
- Practice (`/practice`) is registry-driven: eight sets (seven domain sets plus one mixed set) support
  `?set=` deep links, resume an in-progress attempt, and save progress locally. English questions and
  Vietnamese explanations appear after submission. There is no timer and no official form.
- Versioned local persistence (`cfl.study.v1`) with a content fingerprint, corrupt/incompatible/
  unavailable handling, raw backup download, and a two-step reset. Submitted attempts are immutable.
- The Review page derives incorrect, unanswered, and flagged items from submitted attempts and
  resolves them only through an explicit "Mark reviewed" action.
- Progress separates reviewed-bank coverage from personal performance and shows a real zero-activity
  state instead of a fabricated score.
- The Mock exam page runs a blueprint-weighted **60-of-60 preview** drawn from the 62 reviewed items,
  with no shortfall, no filler, no duplicates, no timer, and no scaled score. Two items are not
  selected in a given deterministic preview.
- The separate timed simulation (`/mock-exam/timed`) runs the verified **60-question / 120-minute**
  format with a persisted deadline, reload resume, auto-submit at expiry, manual/expiry submission
  labels, and an immutable raw result with post-submission review. It stores one attempt at
  `cfl.timed-exam.v1`, independently of Practice data at `cfl.study.v1`. It is original practice
  content, not an official exam form, scaled score, or pass prediction.
- Overall reviewed coverage is **30 / 30** objectives across all seven domains, with a mapped lesson
  and at least two practice items for every objective. Depth remains limited (two to four items per
  objective), so this is not a claim of exam readiness.
- The Context Window sample lesson and its unmapped knowledge check remain available; the sample
  assessment definition is still in the pack but is no longer the `/practice` surface.
- GitHub repository exists at <https://github.com/dev-atlas-lab/claude-associate-foundations-lab> on `main`.
- A GitHub Actions CI workflow (`.github/workflows/ci.yml`) validates pull requests and pushes to
  `main` with typecheck, lint, unit/integration tests, the production build, and the Chromium
  Playwright/axe suite. The first `main` run passed on 2026-10-28
  ([run 40611368468](https://github.com/dev-atlas-lab/claude-associate-foundations-lab/actions/runs/40611368468)).
- No Vercel project has been connected yet.

Local quality gates currently pass: typecheck, lint, **177 unit/integration tests across 23 files**,
**116 Playwright tests across 8 files**, and the production build. Routes are code-split with
`React.lazy`; the timed page is its own 41.25 kB chunk (11.69 kB gzip), the largest JS chunks are
434.92 kB (118.38 kB gzip) and 340.29 kB (107.90 kB gzip), and there is no Vite chunk-size warning.
**71 axe-core scans** cover 35 states in both themes plus the open mobile drawer and report
**0 violations**; manual browser checks cover landmarks, heading order, keyboard focus, skip link,
drawer focus trapping, reduced motion, and responsive widths. The timed suite adds clock-controlled
expiry, reload recovery, corrupt/unavailable storage, and 390/768/1440 px checks. See
`docs/PROGRESS.md` for the detailed log, `docs/ASSESSMENT_ENGINE.md` for assessment decisions, and
`docs/DESIGN_SYSTEM.md` for the design decisions.

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

Run the same gates locally that CI runs:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium   # one-time browser download
npm run test:e2e
```

`npm run test:e2e` rebuilds the production bundle and serves it with `vite preview`, so it also
verifies direct URLs and refreshes through the SPA fallback.

### Browser and accessibility checks

Playwright runs Chromium only. The suite imports the real content registry as fixtures and uses
isolated browser contexts, so it needs no network, credentials, or pre-seeded storage.

```bash
npm run test:e2e                                      # 116 tests; builds, serves, and scans
npx playwright test tests/e2e/accessibility.spec.ts   # axe + keyboard subset
npx playwright show-trace test-results/**/trace.zip   # inspect a recorded failure
```

On a fresh Linux machine, `npx playwright install --with-deps chromium` also installs the required
system libraries. CI uses that command; desktop installs usually only need `npx playwright install
chromium`.

Traces and screenshots for failures are written to `test-results/` (ignored by Git). CI additionally
writes `playwright-report/` and uploads both directories as the `playwright-failure-artifacts`
artifact when a job fails.

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`. It:

1. Checks out the repository and installs Node.js from `.nvmrc` (Node 22 LTS) with npm caching.
2. Runs `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
3. Installs the Chromium build that matches the lockfile (`npx playwright install --with-deps
   chromium`).
4. Runs `npm run test:e2e` against the production preview, including all 71 axe scans.
5. On failure, uploads `test-results/` and `playwright-report/` for seven days.

The workflow requests only `contents: read`, uses no secrets, and does not deploy. Its first `main`
run completed successfully on 2026-10-28. CI does not cover Firefox/WebKit, manual screen-reader
testing, or a Vercel deployment.

## Tech stack

- React 19 + TypeScript 5.9 (strict) + Vite 6
- React Router 7 (`createBrowserRouter`; SPA rewrites in `vercel.json`)
- Zod 4 for runtime validation of the platform domain model and content pack
- Vitest 4 + React Testing Library
- Playwright 1.64 (Chromium) + axe-core 4.14 for browser and accessibility checks
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
- `docs/CONTENT_AUDIT_2026-10-28.md` — full audit of the 62 bank items, lessons, glossary, sources, and timed exam
- `docs/CONTENT_GUIDELINES.md` — language, sourcing, and question-quality rules
- `docs/UX_SPEC.md` — visual direction, navigation, accessibility
- `docs/DESIGN_SYSTEM.md` — implemented tokens, components, theme model, accessibility decisions
- `docs/ASSESSMENT_ENGINE.md` — assessment model, state transitions, scoring, UI, and non-goals
- `docs/IMPLEMENTATION_PLAN.md` — phased delivery plan
- `docs/REPOSITORY_SETUP.md` — GitHub organization/repository state and manual steps
- `docs/PROGRESS.md` — phase log

## Security

Never commit tokens, credentials, or `.env` files. `.gitignore` excludes `.env`, `.env.*` (except `.env.example`), build output, dependencies, and test artifacts.
