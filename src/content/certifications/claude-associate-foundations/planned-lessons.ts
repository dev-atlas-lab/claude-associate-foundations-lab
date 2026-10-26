import { z } from "zod";
import { plannedLessonSchema, type PlannedLesson } from "../../../domain";

/** Visible roadmap entries. They are not routable until written and reviewed. */
export const plannedLessons: PlannedLesson[] = z.array(plannedLessonSchema).parse([
  {
    id: "prompt-structure",
    certificationId: "claude-associate-foundations",
    domainId: "prompting-task-execution",
    title: "Cấu trúc prompt và chỉ dẫn hệ thống",
    note: "Chờ bản nháp nội dung và rà soát nguồn chính thức.",
  },
  {
    id: "evaluation-basics",
    certificationId: "claude-associate-foundations",
    domainId: "output-evaluation-validation",
    title: "Đánh giá output: tiêu chí, bằng chứng và lỗi thường gặp",
    note: "Chờ viết và rà soát theo Domain 2.",
  },
  {
    id: "workflow-design",
    certificationId: "claude-associate-foundations",
    domainId: "workflow-integration-solution-design",
    title: "Thiết kế workflow có bước kiểm tra",
    note: "Chờ viết và rà soát theo Domain 4.",
  },
]);
