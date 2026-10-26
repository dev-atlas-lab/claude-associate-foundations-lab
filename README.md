# Claude Foundations Lab

A frontend-only interactive learning platform for the **Claude Certified Associate – Foundations (CCAO-F)** certification.

The product pairs Vietnamese explanations with English assessments: lessons, interactive visualizations, practice questions, and a timed mock exam. No backend and no API key are required — progress is stored in the browser.

## Current status

Phases B, C0 and C1 are implemented on top of the validated scaffold.

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
- Practice, mock exam, review and progress are honest placeholders: no fake questions, attempts,
  scores, or per-domain item quotas. The mock-exam page shows only the verified format.
- GitHub repository exists at <https://github.com/dev-atlas-lab/claude-associate-foundations-lab> on `main`.
- No Vercel project has been connected yet.

Quality gates currently pass: typecheck, lint, 49 tests across 7 files, and production build. An
axe-core re-run on the dashboard, lesson, mock-exam, and glossary routes in both themes reports 0
violations. The build is a single JavaScript chunk (507.22 kB, 154.02 kB gzip) and now triggers
Vite's >500 kB warning; route splitting is deferred. See `docs/PROGRESS.md` for the detailed log and
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
- `docs/IMPLEMENTATION_PLAN.md` — phased delivery plan
- `docs/REPOSITORY_SETUP.md` — GitHub organization/repository state and manual steps
- `docs/PROGRESS.md` — phase log

## Security

Never commit tokens, credentials, or `.env` files. `.gitignore` excludes `.env`, `.env.*` (except `.env.example`), build output, dependencies, and test artifacts.
