# Progress Log

## Scaffold

- [x] Initial repository structure created.
- [x] React + TypeScript + Vite selected.
- [x] Product and agent instructions drafted.
- [x] GitHub CLI explicitly excluded.
- [x] Vercel SPA rewrite added.
- [x] Dependencies installed and scaffold validated (2026-10-26).
- [x] GitHub remote configured and commits pushed (2026-10-26).
- [ ] Organization renamed/created as `DevAtlasLab` and repository visibility set to private.
- [ ] Official exam guide researched and verified.
- [x] Learning UI shell and design system implemented (Phase B).
- [x] First lesson vertical slice implemented (sample lesson, not mapped to an official objective).
- [ ] Quiz and exam engine implemented.
- [x] Tests and production build pass for implemented features.
- [ ] Vercel deployment verified.

## Scan of 2026-10-26 — repository preparation

- Replaced `latest` dependency ranges with a tested, mutually compatible pinned set.
- Resolved a scaffold compile error (`BrainCircuit` imported in `src/pages/DashboardPage.tsx`).
- Removed 2 critical and 1 moderate advisory by moving Vitest 3 → 4.1.12; `npm audit` now reports 0 vulnerabilities.
- Verified locally with Node 22.11.0: `typecheck` pass, `lint` pass (0 problems), `test` pass (1 file / 1 test), `build` pass (`dist/` produced).
- Verified SPA fallback with `vite preview`: `/` 200, `/learn` 200, hashed JS asset 200.
- Recorded verified official exam facts and the 2026-12-07 content change in `docs/EXAM_BLUEPRINT.md`.
- Documented GitHub organization state and manual steps in `docs/REPOSITORY_SETUP.md`.

## Phase B — design system and app shell (2026-10-26)

### Implemented

- Token-based theme system in `src/styles/tokens.css` with complete Dark and Light palettes, spacing,
  type, radius, elevation and motion scales. Dark is the default; Light and System are available from
  the topbar and Settings.
- `cfl.theme` persistence with a pre-paint bootstrap script in `index.html`, live
  `prefers-color-scheme` tracking for System mode, and safe fallbacks when localStorage is blocked.
- Responsive shell: fixed sidebar and sticky topbar on desktop, off-canvas drawer with scrim,
  `inert` main region, `Escape` handling and focus return on mobile. Skip link, focus-visible rings,
  reduced-motion support.
- Grouped primary navigation and all eight routes: `/`, `/learn`, `/practice`, `/mock-exam`,
  `/review`, `/progress`, `/glossary`, `/settings`. Catch-all 404 inside the shell.
- Reusable UI primitives: `PageHeader`, `Badge`, `Callout` (note / caution / unverified),
  `EmptyState`, `ThemeSwitcher`, `ThemePreferenceForm`.
- Representative lesson route `/learn/context-window` with objectives, Vietnamese explanation,
  preserved English terms, an interactive context-budget diagram, a worked customer-support
  scenario, an English knowledge check with per-option Vietnamese explanations, source citations,
  previous/next lesson navigation, and a sticky table of contents.
- Zod lesson schema validated at module load, plus curriculum, domain-placeholder and glossary data
  modules kept separate from UI.
- Functional glossary search (15 terms) and functional Settings page (theme choice, reset, local
  data disclosure).
- Placeholder pages (Practice, Mock exam, Review, Progress) explicitly labelled as not implemented;
  no fabricated stats, attempts or exam-format claims.

### Verification

- `typecheck`: pass (`tsc -b`, strict).
- `lint`: pass (`eslint .`, 0 problems).
- `test`: pass — 6 files / 26 tests covering theme default/persistence/system/reset, topbar switching,
  navigation and active state, mobile drawer open/close/focus return, unknown routes, lesson
  rendering, diagram interaction, correct and incorrect quiz paths, pager states, glossary
  filtering, and curriculum schema validation.
- `build`: pass (`dist/` produced; SPA preview serves every route, including deep links and unknown
  paths, with HTTP 200).
- Visual review with headless Edge at 1440×900 (dark + light) and 390×844 (mobile + drawer).
- Accessibility: axe-core 4.10.2 audited all ten routes in dark mode plus `/` and the lesson in light
  mode — **0 violations**. The first pass found low-contrast tertiary labels in row numbers, diagram
  percentages and pager labels; those were moved to the secondary text token and disabled pager
  cards now use a dashed border instead of an opacity fade.

### Known gaps

- Official exam guide still unverified; no domain weights, objectives or mock-exam format adopted.
- No progress persistence, question bank, scoring engine, mock exam or review queue yet.
- The axe audit was a one-off browser run, not part of `npm test` or CI.
- No Playwright end-to-end suite yet.
- Lesson table of contents has no scroll-spy.
- The reference site `https://labaws.site/labs` returned no content during this phase, so the design
  follows the documented principles (dense, documentation-oriented, dark-first) rather than a live
  inspection.
- Repository visibility and the `DevAtlasLab` organization name are still pending manual action.
