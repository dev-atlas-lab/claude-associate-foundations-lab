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
- [x] Official exam guide researched and verified (2026-10-26).
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
- Recorded verified official exam facts and a **partially verified** future-revision notice in
  `docs/EXAM_BLUEPRINT.md`.
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

- Official exam guide was still unverified at the end of Phase B; this was resolved in Phase C0
  (Exam Guide v1.0). No domain weights, objectives or mock-exam format had been adopted at that point.
- No progress persistence, question bank, scoring engine, mock exam or review queue yet.
- The axe audit was a one-off browser run, not part of `npm test` or CI.
- No Playwright end-to-end suite yet.
- Lesson table of contents has no scroll-spy.
- The reference site `https://labaws.site/labs` returned no content during this phase, so the design
  follows the documented principles (dense, documentation-oriented, dark-first) rather than a live
  inspection.
- Repository visibility and the `DevAtlasLab` organization name are still pending manual action.

## Phase C0 — official blueprint verification (2026-10-26)

### Verified

- Found the **public** CCAO-F Exam Guide PDF linked from the official Partner Academy
  certifications page. Read **Version 1.0, effective July 2026** in full; no login was needed for the
  guide itself.
- Verified: exam code CCAO-F; **60 items**; **120 minutes** (about 135 minutes seat time); mixed
  multiple-choice / multiple-response with the required response count stated; **720** passing score
  on a **100–1,000** scale; **$99** fee; **12-month** validity; proctored online/test-center delivery.
- Verified the **seven domains and weights**: Prompting and Task Execution 14%, Output Evaluation and
  Validation 21%, Product and Model Selection 12%, Workflow Integration and Solution Design 16%,
  Configuration and Knowledge Management 12%, Governance, Risk, and Responsible Use 15%,
  Troubleshooting and Optimization 10%.
- Verified all **30 detailed objectives** and the three official sample questions (used for format
  calibration only, not copied into the product).
- Rewrote `docs/EXAM_BLUEPRINT.md` with a source register, exact URLs, access date, source-to-claim
  map, unverified items, version warning, and authentication limitations.
- Created `docs/CONTENT_COVERAGE_MATRIX.md` with all 30 objectives, current/planned content,
  general-knowledge safety, and the v1.0 guide dependency.
- The learner's pre-2026-11-14 attempt uses v1.0. The 2026-11-17 guide / 2026-12-07 content revision
  remains **partially verified** because the Pearson VUE page returned HTTP 504; it is tracked as a
  scheduling risk and not blended into v1.0.

### Not claimed

- No per-domain item counts, all-60-scored assumption, item-type split, raw-score conversion, or
  future-guide contents. No third-party study page is used as an exam-fact source.

## Phase C1 — reusable content domain model (2026-10-26)

### Implemented

- Added `src/domain/` with certification-neutral Zod schemas and inferred types:
  - `common.ts`: ids, ISO dates, source records, verification status/record, content status, and
    published/reviewed consistency rules.
  - `certification.ts`: provider, certification, exam format, passing score, domain, objective, and
    versioned blueprint. Weights must be all-or-none and total 100; published verified blueprints must
    state the core format fields.
  - `lesson.ts`: lesson sections, answer choices, single-choice and multiple-response questions,
    correct-answer validation, exam mapping (`unmapped` / `candidate` / `verified`), lesson metadata,
    glossary entries, and planned lessons.
  - `content-pack.ts`: cross-reference validation for duplicate ids, unknown source ids, unknown
    objective ids, mismatched lesson/blueprint certifications, and duplicate question ids.
- Added `src/content/` for certification-specific data:
  - Source registry with claim-level `supports` and access notes.
  - CCAO-F certification, v1.0 blueprint, seven domains, 30 objectives, and exam format.
  - Context Window sample lesson, glossary, and three planned lessons.
  - `src/content/index.ts` parses the whole pack at import time and exposes lesson/source/domain
    lookups. The UI imports the registry; shared renderers import only platform types.
- Migrated the Context Window lesson to the new model:
  - Explicit `examMapping.status: "unmapped"` with no objective ids. The plausible Domain 3
    relationship is documented but not claimed as coverage.
  - Verification metadata checked 2026-10-26 with four source ids; each question cites its sources.
  - Existing single-choice check moved into the `questions` array with Vietnamese rationales for the
    correct answer and every distractor.
- Extended `KnowledgeCheck` to render single-choice radios and multiple-response checkboxes. It scores
  multiple-response by exact set equality, disables inputs after submission, reveals correct answer
  labels textually, and focuses the feedback panel. A UI test covers set-scoring.
- Updated Dashboard, Learn, Practice, Mock exam, Glossary, and Lesson pages so verified blueprint facts
  are shown only where the data supports them. The sample remains visibly unmapped, and the mock
  exam shows the verified format while explicitly saying the timer/question bank are not built.
- Removed the superseded `types.ts`, `curriculum.ts`, `domains.ts`, `glossary.ts`, and old lesson
  modules from `src/features/curriculum/`; the folder now contains rendering code only.

### Verification

- `npm run typecheck`: pass.
- `npm run lint`: pass, 0 problems.
- `npm test`: pass — **7 files / 49 tests**.
- `npm run build`: pass. Single JS bundle **507.22 kB** (gzip **154.02 kB**) with Vite's >500 kB
  chunk-size warning; CSS 31.94 kB (gzip 6.12 kB).
- Accessibility: axe-core 4.10.2 re-run on the built app for `/`, `/learn/context-window`,
  `/mock-exam`, and `/glossary` in both dark and light themes — **0 violations**.
- Schema tests cover: valid certification/blueprint/lesson/question; single-choice exact-one rule;
  valid multiple-response; too few or too many correct choices; duplicate choice ids; duplicate
  correct ids; empty/unknown choice ids; missing lesson sources and verification; non-HTTPS source
  URLs; missing supported claims; published content that is not verified; reviewed content with no
  verification; draft content allowed unverified; duplicate pack source ids; unknown source or
  objective ids; unmapped lessons claiming objectives; verified exam facts citing only product
  documentation; weight totals; and verified published blueprints without format fields.

### Remaining gaps

- Bundle is a single chunk and now exceeds the 500 kB warning threshold; route splitting is deferred.
- No exam-mapped curriculum lesson yet (0 / 30 objectives). The Context Window sample needs an
  Associate-level rewrite before mapping can be reviewed.
- No assessment engine, question bank, mock exam, review queue, or local progress yet.
- Multiple-response rendering is tested, but no multiple-response item is authored in lesson content.
- The future Pearson VUE revision notice is only partially verified; re-check before rescheduling.

## Brand integration (2026-10-26)

- Added the Dev Atlas Lab ink-tile app icon to the sidebar brand lockup, with the product name
  “Claude Foundations” and publisher line “Dev Atlas Lab”.
- Added the same mark to the mobile topbar, where the sidebar is off-canvas.
- Added SVG, 16/32 px PNG and 180 px Apple touch favicons to `index.html`.
- Committed the source brand system under `brand/`; runtime copies live in `public/brand/`.
- Re-ran typecheck, lint, tests (49), production build and a desktop/mobile dark/light smoke check.
