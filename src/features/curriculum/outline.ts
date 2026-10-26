import type { Lesson } from "./types";

export type OutlineItem = { id: string; label: string };

/** Anchor list shared by the lesson body and the sticky table of contents. */
export function lessonOutline(lesson: Lesson): OutlineItem[] {
  const sectionItems = lesson.sections.flatMap((section, index) =>
    section.kind === "callout"
      ? []
      : [{ id: `lesson-section-${index}`, label: section.heading }],
  );

  return [
    { id: "lesson-objectives", label: "Mục tiêu bài học" },
    ...sectionItems,
    { id: "lesson-terms", label: "Thuật ngữ chính" },
    { id: "lesson-scenario", label: "Tình huống thực tế" },
    { id: "lesson-check", label: "Knowledge check" },
    { id: "lesson-summary", label: "Tóm tắt" },
  ];
}
