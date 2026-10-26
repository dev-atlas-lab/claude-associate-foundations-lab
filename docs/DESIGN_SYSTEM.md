# Design System and Application Shell

Phase B establishes the reusable layer the curriculum will sit on. Anything in this document can be
changed, but the constraints it protects (theme correctness, keyboard access, honest states) should
not regress.

## Theme model

- The document root carries `data-theme="dark|light"` and `data-theme-preference="dark|light|system"`.
- All colours resolve from CSS variables in `src/styles/tokens.css`. Components never hard-code a
  colour, so both themes stay consistent by construction.
- **Dark is the product default.** A first-time visitor gets dark even when the operating system
  prefers light. `System` is an explicit opt-in that follows `prefers-color-scheme` and updates live
  through a `matchMedia` listener.
- The preference is stored in `localStorage` under `cfl.theme` (`src/lib/theme.ts`).
- `index.html` contains a tiny bootstrap script that applies the stored theme before first paint,
  preventing a flash of the wrong theme. `ThemeProvider` then owns the same state for React.
- Storage access is wrapped in `try/catch`: private browsing or blocked storage degrades to an
  in-memory preference instead of breaking the app.

### Known theme trade-off

Because dark is the default rather than `System`, a visitor on a light OS sees dark until they choose
`System`. This follows the product requirement that the app be dark by default and is documented
here so it is not mistaken for a bug.

## Typography

- UI/body: system font stack led by `Inter` if it is installed locally, then platform UI fonts.
- Labels, eyebrow text, code, percentages and key names: `JetBrains Mono`, then platform monospace.
- No web fonts are downloaded. This keeps the UI usable offline, avoids render-blocking font
  requests, and makes the "no network calls" claim on the Settings page accurate. The trade-off is
  slightly different typography per operating system.

Type scale, line heights, spacing (`--space-1`…`--space-16`), radii and motion durations are all
tokens in `src/styles/tokens.css`. Reading surfaces use `--lesson-column: 68ch`.

## Colour tokens

Each theme defines: five surface levels (`--surface-0`…`--surface-3`, `--surface-inset`), two border
levels, three text levels, one accent pair plus quiet/contrast variants, and info / success / warning
/ danger tones with quiet backgrounds. Elevation is expressed as `--shadow-sm` / `--shadow-md`, and
modal scrims use `--overlay`.

Contrast targets: body and secondary text meet WCAG AA on their surfaces; tertiary text is reserved
for meta labels at small sizes and is not used for essential instructions. Focus is always a 2px
`--focus-ring` outline with offset, independent of the browser default.

## Layout

- `≥1024px`: fixed 264px sidebar, sticky 58px topbar with breadcrumb and theme switcher, content
  capped at 1080px.
- `<1024px`: the sidebar becomes an off-canvas drawer with a scrim. The main region receives `inert`
  while the drawer is open, so focus cannot escape behind it. `Escape`, the scrim and the close
  button all dismiss it; focus returns to the menu button.
- Closed off-canvas navigation uses `visibility: hidden` as well as a transform, so links are not
  tabbable while invisible.
- `≥1200px`: lesson pages add a sticky "On this page" table of contents. It has no scroll-spy yet;
  anchors are static.
- Page changes scroll to the top and move focus to `<main>`; the first load does not steal focus.

## Brand assets

- `brand/` is the master brand system: SVG mark, lockups, app icon, favicon, social cards and the
  static brand guide. It is not served directly by Vite.
- The assets needed at runtime are copied to `public/brand/`: `app-icon.svg`, `favicon.svg`, the
  16/32 px PNG favicons and the 180 px Apple touch icon. `index.html` links the favicon set.
- The sidebar uses the ink-tile app icon at 34 px with the product name “Claude Foundations” and the
  publisher line “Dev Atlas Lab”. The compact topbar shows the same mark below 1024 px, where the
  sidebar is off-canvas. The image is decorative (`alt=""`) because the adjacent brand text already
  names the product.
- Logo files follow the source brand rules: no stretching or recolouring, and the ink tile is used
  wherever a square is required. The mark remains legible at 16 px because the favicon has a
  simplified path.

## Components

| Component | Path | Purpose |
| --- | --- | --- |
| `AppShell` | `src/components/layout/AppShell.tsx` | Shell, drawer state, focus and scroll management, skip link |
| `Sidebar` / `Topbar` | `src/components/layout/` | Grouped primary navigation, mobile toggle, breadcrumb |
| `ThemeSwitcher` | `src/components/theme/ThemeSwitcher.tsx` | Three-state compact control used in the topbar |
| `ThemePreferenceForm` | `src/components/theme/ThemePreferenceForm.tsx` | Radio-card version used in Settings |
| `PageHeader` | `src/components/ui/PageHeader.tsx` | Eyebrow, title, lede, badges and actions |
| `Badge` | `src/components/ui/Badge.tsx` | Status/verification labels (accent, ok, warn, info) |
| `Callout` | `src/components/ui/Callout.tsx` | Note, caution and **unverified** content warnings |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | Honest "not implemented / nothing here" states |
| `KnowledgeCheck` | `src/features/curriculum/components/KnowledgeCheck.tsx` | English single-choice check with Vietnamese feedback |
| `ContextWindowDiagram` | `src/features/visualizations/ContextWindowDiagram.tsx` | Interactive, non-SVG budget diagram |
| `LessonContent` / `LessonPager` / `LessonToc` | `src/features/curriculum/components/` | Lesson rendering, prev/next, outline |

Content is validated with Zod at module load (`src/domain/` schemas, `src/content/` data), including
source and objective cross-references, choice ids, correct-answer counts, and single-choice vs
multiple-response rules. The schema separates content from UI so a larger bank can be added without
touching page components.

## Accessibility decisions

- Skip link to `#main-content`; visible focus on every interactive element.
- `NavLink` supplies `aria-current="page"`; the active item is styled from that attribute rather than
  a parallel class.
- The diagram is an accessible figure: the colour bar is decorative (`aria-hidden`), while real
  buttons drive the detail panel and expose `aria-pressed`.
- The knowledge check uses native radios for single-choice and native checkboxes for
  multiple-response inside a `<fieldset>` with the English question as the legend. After submission,
  each option is labelled textually ("Correct answer" / "Your answer") so correctness never relies on
  colour, and focus moves to the `role="status"` feedback panel.
- Disabled prev/next pager cards are non-interactive `<div>`s, not dead links.
- Reduced-motion preferences collapse all transitions and animations.
- Quiz stems and options are marked `lang="en"` inside a `lang="vi"` document; technical key terms
  keep the English term alongside the Vietnamese explanation.

## States and honesty rules

- No placeholder page shows fake statistics, fake question counts or a start button that does
  nothing. Practice, mock exam and review explain what is missing and why.
- Exam-specific claims are shown only when the matching blueprint version is verified. The data
  carries explicit verification status, checked date, and source ids; unverified claims, when shown
  at all, use the `unverified` callout.
- The only authored lesson is a context-window sample explicitly marked as unmapped to an official
  objective. The verified blueprint and the unmapped sample are presented as separate facts.

## Verification status

- Theme persistence, system-following, reset, topbar switching, navigation, active state, mobile
  drawer behaviour, unknown routes, lesson quiz scoring/feedback, pager states, diagram interaction,
  glossary filtering, content-pack validation, and single/multiple-response schemas are covered by
  Vitest + Testing Library tests (`src/test/`, 49 tests).
- Layout and both themes were visually checked with headless Edge screenshots at 1440×900 and
  390×844 (dashboard, lesson, glossary, settings, mobile drawer). Screenshots are not committed.
- axe-core 4.10.2 was injected into the built app and run against all ten routes in dark mode plus
  the dashboard and lesson in light mode: 0 violations. This audit is a one-off browser check, not a
  CI gate; adding axe to the test suite is a follow-up.
- No Playwright end-to-end suite exists yet.
