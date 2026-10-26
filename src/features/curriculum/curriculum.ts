import { contextWindowLesson } from "./lessons/context-window";
import type { Lesson, PlannedLesson } from "./types";

/**
 * Only reviewed lessons live here. A lesson is "published" when its text,
 * diagram, and knowledge check have been checked against primary sources.
 */
export const publishedLessons: Lesson[] = [contextWindowLesson];

/** Visible roadmap entries; they are intentionally not routable yet. */
export const plannedLessons: PlannedLesson[] = [
  {
    id: "prompt-structure",
    title: "Cấu trúc prompt và chỉ dẫn hệ thống",
    note: "Chờ bản nháp nội dung và rà soát nguồn chính thức.",
  },
  {
    id: "evaluation-basics",
    title: "Đánh giá output: tiêu chí, bằng chứng và lỗi thường gặp",
    note: "Chờ xác minh trước khi viết.",
  },
  {
    id: "workflow-design",
    title: "Thiết kế workflow có bước kiểm tra",
    note: "Chờ xác minh trước khi viết.",
  },
];

export function getLesson(id: string | undefined): Lesson | undefined {
  if (!id) {
    return undefined;
  }

  return publishedLessons.find((lesson) => lesson.id === id);
}

export function getLessonNeighbours(id: string): {
  previous?: Lesson;
  next?: Lesson;
  plannedNext?: PlannedLesson;
} {
  const index = publishedLessons.findIndex((lesson) => lesson.id === id);

  if (index === -1) {
    return {};
  }

  return {
    previous: publishedLessons[index - 1],
    next: publishedLessons[index + 1],
    plannedNext: index === publishedLessons.length - 1 ? plannedLessons[0] : undefined,
  };
}
