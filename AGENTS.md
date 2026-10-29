# Agent Instructions — Claude Foundations Lab

## Mission

Build a high-quality, frontend-only learning platform for Claude Certified Associate – Foundations. Do not stop at a plan or static homepage. Research the official exam guide, implement working features, test them, and prepare GitHub/Vercel deployment when credentials are available.

## Before changing code

1. Inspect the repository, current branch, Git status, remotes, package scripts, and existing files.
2. Preserve existing user work. Never use destructive Git commands to force progress.
3. Never delete important project files (such as `src/domain/*`, `src/content/*`, `docs/*`, `package.json`, `vercel.json`, or `.env*`) or run file-deletion commands (`rm`, `git rm`, `git clean`, `git reset --hard`) without explicitly notifying the user and asking for confirmation first. Conversely, proceed autonomously with safe coding, testing, linting, and building tasks without waiting for manual approval.
4. Read `docs/PRODUCT_SPEC.md`, `docs/EXAM_BLUEPRINT.md`, `docs/CONTENT_GUIDELINES.md`, `docs/UX_SPEC.md`, and `docs/IMPLEMENTATION_PLAN.md`.
5. Research official Anthropic certification sources and record URLs and limitations. Do not invent exam objectives, weights, or official question content.

## Product constraints

- Stack: React + TypeScript + Vite. Do not use Next.js.
- Use React Router for client-side routing.
- Frontend only: no backend, database, or Claude API key for the MVP.
- Use local JSON/TypeScript content data and localStorage for progress.
- Learning explanations: Vietnamese, with important English terminology preserved.
- Quiz/exam questions, answer choices, and instructions: English.
- Feedback and detailed answer explanations: Vietnamese, retaining technical terms.
- Practice questions must be original and must not be described as official exam questions.
- Visualizations must teach concepts and be interactive when appropriate.
- Ensure deep links and refreshes work on Vercel; keep `vercel.json` SPA rewrites.
- Prefer accessible semantic HTML, keyboard operation, visible focus, responsive design, and reduced-motion support.

## Engineering practices

- Keep curriculum content separate from UI and assessment logic.
- Use strict TypeScript; avoid `any` unless justified and documented.
- Validate question-bank and curriculum data with Zod or an equivalent runtime schema.
- Add tests for scoring, multiple-response questions, persistence, and core user journeys.
- Run typecheck, lint, tests, and production build after meaningful changes.
- Fix failures instead of merely reporting them. If a check cannot run, state why.
- Do not leave dead buttons, placeholder routes, fake metrics, or nonfunctional controls.
- Keep dependencies minimal and compatible; explain significant architectural choices. Pin tested version ranges instead of `latest`, and keep the Node baseline (`>=20.19.0`, tested on 22.11) in sync with `package.json` `engines`.
- Update `docs/PROGRESS.md` as phases are completed.

## GitHub and credentials

- Do not use GitHub CLI (`gh`).
- Never ask the user to paste tokens into chat or hardcode tokens into source, scripts, remotes, docs, or logs.
- Prefer HTTPS Git with a secure credential manager for push.
- Verify the remote owner/repository before pushing.
- Never force-push, rewrite history, overwrite unrelated repositories, or discard user changes.
- If no remote exists, continue local implementation and report the exact setup needed.
- Create meaningful commits only after relevant checks pass.

## Vercel

- Prefer a GitHub-to-Vercel integration for automatic deployments.
- Vercel CLI may be used if installed and securely authenticated.
- Never print or commit tokens.
- Do not incur paid costs or purchase domains without explicit approval.
- Never claim deployment succeeded unless the live deployment URL and status are verified.

## Definition of done

A working, tested learning experience with traceable coverage for all official exam domains, substantial Vietnamese lessons, interactive visuals, English assessments, answer explanations, local progress, review mode, documentation, and verified deployment when access is available.

## UI/UX Direction — Reference: https://labaws.site/labs

Treat the reference website as the primary visual and interaction inspiration. Inspect it directly before implementing. Reproduce its useful design principles and information hierarchy, not its exact branding or proprietary assets.

### Visual direction
- Build a polished, documentation-oriented interactive learning workspace rather than a generic SaaS dashboard.
- Use a dark theme by default, with a complete Light / Dark / System theme switcher.
- Persist theme preference in localStorage and respect `prefers-color-scheme` for System mode.
- Use layered dark surfaces, subtle borders, restrained accent colors, readable typography, and consistent spacing.
- Avoid excessive gradients, glowing effects, oversized hero sections, and decorative cards that do not improve usability.

### Layout
- Desktop: persistent left navigation, clear top-level context, spacious main reading area, and optional right-side table of contents for lessons.
- Mobile: responsive navigation and content layouts; never simply shrink the desktop layout.
- Organize navigation around Dashboard, Learn, Practice, Mock Exam, Review, Progress, Glossary, and Settings.
- Make the lesson experience feel like a technical learning environment, with clear section hierarchy, code examples, diagrams, comparison tables, callouts, and progress indicators.

### Learning interactions
- Vietnamese is the lesson language; preserve important English technical terminology.
- Question stems, answer choices, and exam instructions must be in English.
- Provide interactive visualizations where they improve conceptual understanding.
- Support keyboard navigation, visible focus, accessible contrast, and reduced motion.
- Every visible control must work. Avoid placeholder buttons, fake progress, and decorative-only functionality.

### Design system and implementation
- Establish reusable design tokens for colors, typography, spacing, borders, radii, and elevation.
- Use CSS variables or an equivalent theme-token approach so all components support both themes consistently.
- Keep the existing React + TypeScript + Vite stack. Do not migrate to Next.js.
- Inspect the current scaffold first, then propose a concise UI implementation plan and implement it in small, testable steps.
- Validate desktop and mobile layouts, both themes, navigation, and persistence before marking the UI phase complete.