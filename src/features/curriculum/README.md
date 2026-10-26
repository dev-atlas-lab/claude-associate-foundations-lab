# Curriculum feature

Lesson content and curriculum metadata live here, separate from page components.

- `types.ts` — Zod schemas and inferred TypeScript types.
- `lessons/` — lesson data, one module per lesson, validated at import time.
- `curriculum.ts` — published lesson order, planned roadmap entries, neighbour lookup.
- `domains.ts` — **provisional** domain titles; all marked unverified until the official guide is
  reviewed.
- `glossary.ts` — English–Vietnamese study glossary.
- `components/` — lesson rendering, knowledge check, pager and table of contents.
- `outline.ts` — anchor list shared by the lesson body and TOC.

Only add a lesson to `publishedLessons` after its claims are checked against primary sources and its
knowledge check has an explanation for every option. Planned entries are visible but not routable.
