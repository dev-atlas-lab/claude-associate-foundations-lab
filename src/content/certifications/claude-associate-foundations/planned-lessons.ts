import { z } from "zod";
import { plannedLessonSchema, type PlannedLesson } from "../../../domain";

/** Visible roadmap entries. They are not routable until written and reviewed. */
export const plannedLessons: PlannedLesson[] = z.array(plannedLessonSchema).parse([
  {
    id: "workflow-design",
    certificationId: "claude-associate-foundations",
    domainId: "workflow-integration-solution-design",
    title: "Thiết kế workflow có bước kiểm tra",
    note: "Chờ viết và rà soát theo Domain 4. Bài prompt-structure và configuration-basics đã được publish.",
  },
]);
