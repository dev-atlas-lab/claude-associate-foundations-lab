import { z } from "zod";
import {
  contentStatusProblem,
  contentStatusSchema,
  identifierSchema,
  verificationSchema,
} from "./common";
import { examMappingSchema, questionSchema } from "./lesson";

/**
 * A reviewed bank entry wraps the existing question schema with the metadata a
 * practice item needs: certification/blueprint scope, exam-objective mapping,
 * review status, and verification sources.
 *
 * The question itself is not duplicated or redefined. Lesson questions remain
 * valid without bank metadata; bank entries are for items that are intended to
 * be selectable as exam-mapped practice content.
 */
export const questionBankEntrySchema = z
  .object({
    question: questionSchema,
    certificationId: identifierSchema,
    blueprintId: identifierSchema,
    examMapping: examMappingSchema,
    contentStatus: contentStatusSchema,
    verification: verificationSchema,
  })
  .superRefine((entry, ctx) => {
    const statusProblem = contentStatusProblem(entry.contentStatus, entry.verification);

    if (statusProblem) {
      ctx.addIssue({ code: "custom", message: statusProblem, path: ["contentStatus"] });
    }

    if (entry.examMapping.status === "unmapped") {
      ctx.addIssue({
        code: "custom",
        message:
          "question-bank entries must declare an exam objective; keep unmapped design samples inside a lesson",
        path: ["examMapping", "status"],
      });
    }

    if (entry.examMapping.status === "verified" && entry.verification.status !== "verified") {
      ctx.addIssue({
        code: "custom",
        message: "a verified exam mapping requires verified question-bank content",
        path: ["examMapping", "status"],
      });
    }

    const verifiedSourceIds = new Set(entry.verification.sourceIds);

    entry.question.sourceIds.forEach((sourceId, index) => {
      if (!verifiedSourceIds.has(sourceId)) {
        ctx.addIssue({
          code: "custom",
          message: `question source "${sourceId}" is missing from verification.sourceIds`,
          path: ["question", "sourceIds", index],
        });
      }
    });
  });

export type QuestionBankEntry = z.infer<typeof questionBankEntrySchema>;
