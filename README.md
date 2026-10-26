# Claude Foundations Lab

A frontend-only interactive learning platform for preparing for the Claude Certified Associate – Foundations certification.

## Current status

This repository is a starter scaffold. The curriculum, interactive lessons, question bank, and exam engine are to be researched and implemented by the coding agent using the official certification guide as the source of truth.

## Requirements

- Node.js LTS
- npm
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

## Tech stack

- React + TypeScript + Vite
- React Router
- Zod for runtime data validation
- Vitest + React Testing Library
- Playwright for end-to-end tests
- Vercel for static frontend hosting

Choose and install Tailwind CSS / shadcn/ui and diagram libraries during implementation. Verify compatibility before adding dependencies.

## Product principles

- Learning explanations are in Vietnamese; important English technical terms remain unchanged.
- All practice and exam question stems, options, and instructions are in English.
- Answer explanations may be in Vietnamese while preserving key terminology.
- Original practice questions must not be presented as official exam questions.
- No backend or Claude API key is required for the MVP.
- Learning progress is stored locally in the browser and is not synchronized across devices.
- Never commit tokens, credentials, or `.env` files.

## Documentation

See `docs/` for product, curriculum, UX, content, architecture, and implementation planning documents.
