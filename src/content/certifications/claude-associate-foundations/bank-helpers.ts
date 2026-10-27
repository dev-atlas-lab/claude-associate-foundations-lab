import {
  questionBankEntrySchema,
  type Question,
  type QuestionBankEntry,
} from "../../../domain";

const guideSourceId = "ccao-f-exam-guide-v1";

/**
 * Wrap an original practice question with the review metadata every bank item
 * needs: a verified blueprint mapping, a content-review record, and explicit
 * source traceability. The exam guide is always included because the objective
 * mapping itself comes from the guide; technical sources support the claims in
 * the question and its explanations.
 */
export function reviewedEntry(
  question: Question,
  objectiveId: string,
  technicalSourceIds: readonly string[],
  checkedAt = "2026-10-27",
): QuestionBankEntry {
  const sourceIds = [...new Set([guideSourceId, ...technicalSourceIds])];

  return questionBankEntrySchema.parse({
    question,
    certificationId: "claude-associate-foundations",
    blueprintId: "ccao-f-v1",
    examMapping: {
      status: "verified",
      objectiveIds: [objectiveId],
      note: `Original practice item mapped to the verified CCAO-F v1.0 objective "${objectiveId}". It is not official exam content.`,
    },
    contentStatus: "published",
    verification: {
      status: "verified",
      checkedAt,
      note: "Reviewed against Exam Guide v1.0 for objective scope and against the cited Anthropic documentation for the technical claims. The item is original; no official question or third-party exam content was copied.",
      sourceIds,
    },
  });
}
