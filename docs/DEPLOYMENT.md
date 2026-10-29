# Deployment & Verification Guide (Phase G)

## Current Deployment Readiness Status

- **Repository:** `https://github.com/dev-atlas-lab/claude-associate-foundations-lab` (`main`)
- **Framework:** Vite + React 19 + TypeScript (frontend-only SPA; no server functions, database, or runtime environment variables required)
- **SPA Routing Rewrites:** Configured in [`vercel.json`](../vercel.json):
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- **CI Quality Gates:** Verified on every push/PR to `main` via [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) (`npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and Chromium Playwright E2E + `axe-core` against `vite preview`).
- **Live Vercel Status:** Not yet deployed (`0` GitHub deployments reported for `dev-atlas-lab/claude-associate-foundations-lab`, and no Vercel credentials/CLI are present in the development VM).

---

## Option 1: GitHub-to-Vercel Integration (Recommended)

1. Sign in to [Vercel](https://vercel.com/new) and import the GitHub repository **`dev-atlas-lab/claude-associate-foundations-lab`**.
2. Verify the auto-detected build settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci`
   - **Node.js Version:** `22.x` (matches `.nvmrc` and `package.json` `engines.node`)
   - **Environment Variables:** None required.
3. Click **Deploy**. Every push to `main` will automatically deploy to production, and pull requests will receive preview URLs.

---

## Option 2: Authenticated Vercel CLI Deployment

From a machine with an authenticated Vercel CLI session (`vercel login`):

```bash
vercel link
vercel deploy --prod
```

Never hardcode or commit Vercel tokens into repository files, scripts, or Git remotes.

---

## Post-Deployment Verification Checklist

Once the live URL (`https://<your-project>.vercel.app`) is active, verify direct-route loads and browser refreshes (confirming `vercel.json` SPA rewrites):

1. `/` — Dashboard ("Your study desk")
2. `/learn` and `/learn/evaluation-basics` — Curriculum index and lesson deep link
3. `/practice` and `/practice?set=domain-2-output-validation-set` — Practice index and set deep link
4. `/mock-exam` and `/mock-exam/timed` — Untimed preview and timed simulation
5. `/review` and `/review?mode=practice` — Mistake review queue and focused practice mode
6. `/progress`, `/glossary`, and `/settings` — Progress report, glossary, and preferences
