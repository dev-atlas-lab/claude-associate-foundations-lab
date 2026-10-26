# Curriculum rendering feature

This folder contains presentation code only. Certification-neutral schemas live in `src/domain/`,
and certification-specific data lives in `src/content/`.

- `components/` — lesson body, knowledge check, pager, and table of contents.
- `outline.ts` — anchor list shared by the lesson body and the sticky TOC.

The renderer receives validated `Lesson`, `Question`, and `Source` objects. It never imports a
certification name, provider, domain title, or domain weight directly. Pages resolve those from the
content registry in `src/content/`.

Content rules:

- Lesson prose is Vietnamese; English technical terms stay intact.
- Question stems, choices, and exam instructions are English.
- Correct-answer and distractor explanations are Vietnamese.
- A lesson is only published after its technical claims are checked against primary sources.
- Exam mapping is separate from technical verification. Do not mark a lesson exam-mapped without a
  verified objective id from the matching blueprint version.
