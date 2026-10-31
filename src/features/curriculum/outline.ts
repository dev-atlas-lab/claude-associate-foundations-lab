import type { Lesson } from "../../domain";

export type OutlineItem = { id: string; label: string };

/** Anchor list shared by the lesson body and the sticky table of contents. */
export function lessonOutline(lesson: Lesson): OutlineItem[] {
  const sectionItems = lesson.sections.flatMap((section, index) =>
    section.kind === "callout"
      ? []
      : [{ id: `lesson-section-${index}`, label: section.heading }],
  );

  return [
    { id: "lesson-objectives", label: "Lesson objectives" },
    ...sectionItems,
    { id: "lesson-terms", label: "Key terms" },
    { id: "lesson-scenario", label: "Real-world scenario" },
    ...(lesson.relatedQuestionIds.length > 0
      ? [{ id: "lesson-related-practice", label: "Practice questions" }]
      : []),
    { id: "lesson-check", label: "Knowledge check" },
    { id: "lesson-summary", label: "Summary" },
  ];
}
