# End-to-end and accessibility tests

Playwright runs Chromium against the **production build** served by `vite preview`. The same
`index.html` fallback used by `vercel.json` serves every route, so direct URLs and refreshes are tested
as deployed rather than through the dev server.

## Prerequisites

```bash
npx playwright install chromium        # desktop: one-time browser download
npx playwright install --with-deps chromium   # fresh Linux, CI, or a container
```

`--with-deps` also installs the system libraries Chromium needs and may require `sudo` locally. The
browser version is selected by the locked `@playwright/test` version; do not install a floating
browser build.

No backend, API key, network access, or seeded account is required. The web server command runs
`npm run build` automatically, then serves the bundle on `127.0.0.1:4173`. Existing servers are never
reused.

## Commands

```bash
npm run test:e2e                                      # all 104 tests
npx playwright test tests/e2e/accessibility.spec.ts   # axe + keyboard checks
npx playwright test -g "exact set"                    # one flow
npx playwright show-trace test-results/**/trace.zip   # inspect a failure
```

## Continuous integration

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`. After `npm ci`, typecheck,
lint, unit tests, and the production build, CI installs Chromium with
`npx playwright install --with-deps chromium` and runs `npm run test:e2e`. The job sets `CI=true`, so
Playwright uses two workers, one retry, `forbidOnly`, and the HTML reporter.

On failure, the `playwright-failure-artifacts` artifact contains `test-results/` (trace, screenshot,
and error context for each failed test) and `playwright-report/` (the HTML report). Both are ignored
by Git and retained for seven days. Do not disable accessibility or E2E tests to make CI pass; fix
the underlying failure or the test isolation issue.

To mirror the CI branch locally:

```bash
$env:CI="true"; npm run test:e2e   # PowerShell
CI=true npm run test:e2e           # bash
```

The first `main` run passed on 2026-10-28
([run 40611368468](https://github.com/dev-atlas-lab/claude-associate-foundations-lab/actions/runs/40611368468));
the Chromium install and E2E/accessibility steps both succeeded. The failure-artifact upload step was
skipped, as expected on a green run.

## Coverage

| File | What it proves |
|---|---|
| `navigation.spec.ts` | Shell routes, all 8 lessons, objective mappings, pager, deep links, invalid IDs, 404, unmapped sample, honest assessment shortcuts |
| `practice.spec.ts` | Set selection and `?set=`, answer changes, flags, cross-question persistence, exact-set multiple response, submitted review, unanswered vs incorrect |
| `persistence.spec.ts` | In-progress reload, valid restore, corrupt JSON, stale fingerprint, incompatible schema, blocked/unreadable storage, two-step reset, backup downloads |
| `review-progress.spec.ts` | Review derivation, filters, mark-reviewed persistence, zero activity, coverage vs performance, dashboard/mock registry counts, 60-slot preview allocation |
| `theme.spec.ts` | Dark default, topbar and Settings switching, System `prefers-color-scheme`, reload persistence |
| `accessibility.spec.ts` | axe scans for 32 states in both themes plus the open drawer, landmarks, heading order, skip link, drawer trap, labels, focus management, reduced motion |
| `responsive.spec.ts` | No horizontal overflow or clipped controls at 390 / 768 / 1440 px; mobile runner and drawer |

## Fixtures and isolation

- `helpers/fixtures.ts` imports the real content registry (`src/content`) and exports the same
  assessment definitions, questions, answer keys, lessons, and mock allocation the app uses. Expected
  values are not duplicated by hand.
- Every Playwright test gets an isolated browser context, so localStorage, theme, and attempts never
  leak between tests.
- `helpers/a11y.ts` injects `axe-core/axe.min.js` directly, finishes CSS transitions before scanning
  (axe otherwise samples a 120 ms button reveal transition), and fails on any violation. No rules are
  disabled or excluded.
- Selectors prefer roles, accessible names, and visible text. Structural selectors are limited to
  table bodies and `.app-main` where the accessible tree cannot express the assertion.

## Limitations

- Chromium only; Firefox and WebKit are not installed or run.
- axe cannot replace a manual NVDA/VoiceOver pass.
- The Timed Mock Exam is not implemented, so no timer, auto-submit, expiry, or scaled-score flow is
  tested.
- GitHub Actions runs this suite on pull requests and `main`; its first run passed, but it is still
  Chromium-only.
- No cross-browser or manual screen-reader testing is included in CI.
