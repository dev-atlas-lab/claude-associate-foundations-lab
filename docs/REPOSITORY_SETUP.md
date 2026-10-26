# Repository and Deployment Setup

Verified state as of 2026-10-26. Anything not marked **verified** is an assumption or a pending action.

## Intended destination

| Setting | Intended | Actual (verified) |
|---|---|---|
| Organization | `DevAtlasLab` | **Does not exist** |
| Repository | `claude-associate-foundations-lab` | Exists under `dev-atlas-lab` |
| Default branch | `main` | `main` |
| Visibility | Private during development | **Public** |

## Verified findings

- `https://github.com/DevAtlasLab` returns HTTP 404, and so does `https://api.github.com/users/DevAtlasLab`. The name is unclaimed, but no organization by that name exists.
- An organization named `dev-atlas-lab` exists (numeric id `348311919`, created 2026-10-26), and it owns `dev-atlas-lab/claude-associate-foundations-lab`.
- GitHub treats names case-insensitively but **not** punctuation-insensitively, so `DevAtlasLab` and `dev-atlas-lab` are different accounts.
- The repository is currently **public** (`"visibility": "public"` in the GitHub API response), which contradicts the private-during-development preference.
- The local `origin` remote points at `https://github.com/dev-atlas-lab/claude-associate-foundations-lab.git`, and HTTPS pushes authenticate through the machine's Git Credential Manager. No `gh` CLI and no token were used, printed, or stored.
- The GitHub REST API has no endpoint for creating an organization, renaming an organization, or transferring a repository between owners. These require the web UI with Owner/Admin permissions.

## Manual steps to reach the intended state

Choose one option, then set visibility.

### Option A — Rename the existing organization (keeps the repository and its history)

1. Open <https://github.com/organizations/dev-atlas-lab/settings/profile> (Organization settings → Profile).
2. Under **Organization account name**, rename `dev-atlas-lab` to `DevAtlasLab` and confirm.
3. GitHub redirects the old URLs, but update the remote explicitly:
   `git remote set-url origin https://github.com/DevAtlasLab/claude-associate-foundations-lab.git`

### Option B — Create a new organization and transfer the repository

1. Create the organization at <https://github.com/account/organizations/new> (`DevAtlasLab`, free plan).
2. As a repository admin, open the repository's **Settings → General → Danger zone → Transfer ownership** and transfer it to `DevAtlasLab`.
3. Update the remote:
   `git remote set-url origin https://github.com/DevAtlasLab/claude-associate-foundations-lab.git`

### Make the repository private

Repository **Settings → General → Danger zone → Change repository visibility → Make private**, confirm the repository name, then acknowledge the effects (forks, stars, and public links stop working). Private repositories are available on the GitHub Free plan; no billing change is required.

## Authentication notes

- Pushing uses the HTTPS remote plus Git Credential Manager. Nothing in this repository depends on `gh`.
- Do not paste tokens into chat, files, remotes, scripts, or logs. If the credential manager stops working, re-authenticate through Git Credential Manager or a GitHub OAuth/PAT flow entered directly into the operating-system credential helper.

## Vercel readiness

- Vite produces `dist/` via `npm run build`.
- `vercel.json` rewrites every path to `/index.html`, and Vite serves static files ahead of the rewrite, so `/assets/*` is unaffected. SPA fallback was verified locally with `vite preview`: `GET /` → 200, `GET /learn` → 200 with the app shell, `GET /assets/index-*.js` → 200 `text/javascript`.
- No Vercel project exists yet. Connect it through the dashboard: **Add New → Project → Import Git Repository**, select the repository, framework preset **Vite**, build command `npm run build`, output directory `dist`.
- Verify after deploying: `/`, a deep route such as `/learn` on hard refresh, and both themes.
