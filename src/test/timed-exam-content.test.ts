import { describe, expect, it } from "vitest";
import { contentFingerprint } from "../content/fingerprint";
import { questionBankEntries } from "../content";
import {
  resolveTimedExamQuestions,
  selectTimedExamQuestionIds,
  timedExamAvailability,
  timedExamContentFingerprint,
  timedExamDurationMinutes,
  timedExamEligibility,
  timedExamRequestedItemCount,
} from "../content/timed-exam";

describe("timed exam content selection", () => {
  it("fills the verified 60-item / 120-minute format from the reviewed bank", () => {
    expect(timedExamRequestedItemCount).toBe(60);
    expect(timedExamDurationMinutes).toBe(120);
    expect(timedExamEligibility.availableItemCount).toBe(questionBankEntries.length);
    expect(timedExamEligibility.shortfall).toBe(0);
    expect(timedExamEligibility.selectedItemCount).toBe(60);
    expect(timedExamAvailability.selectedQuestionIds).toHaveLength(60);
    expect(new Set(timedExamAvailability.selectedQuestionIds).size).toBe(60);
    expect(timedExamEligibility.allocations).toHaveLength(7);
    expect(timedExamEligibility.allocations.map((allocation) => allocation.weightPercent)).toEqual([
      14, 21, 12, 16, 12, 15, 10,
    ]);
    expect(timedExamEligibility.allocations.map((allocation) => allocation.available)).toEqual([
      9, 14, 8, 11, 8, 10, 7,
    ]);
    // Every domain has at least one spare reviewed item beyond its blueprint
    // allocation, and the allocator fills the exact 60-item distribution:
    // 8 / 13 / 7 / 10 / 7 / 9 / 6.
    expect(timedExamEligibility.allocations.map((allocation) => allocation.allocated)).toEqual([
      8, 13, 7, 10, 7, 9, 6,
    ]);
    expect(
      timedExamEligibility.allocations.every(
        (allocation) =>
          allocation.available > 0 &&
          allocation.allocated > 0 &&
          allocation.allocated < allocation.available,
      ),
    ).toBe(true);
    expect(
      timedExamEligibility.allocations.reduce(
        (total, allocation) => total + allocation.allocated,
        0,
      ),
    ).toBe(60);
  });

  it("selects only reviewed items and resolves every one", () => {
    const questionIds = selectTimedExamQuestionIds("attempt-content-test");
    const reviewedIds = new Set(questionBankEntries.map((entry) => entry.question.id));
    const resolved = resolveTimedExamQuestions(questionIds);

    expect(questionIds).toHaveLength(60);
    expect(questionIds.every((questionId) => reviewedIds.has(questionId))).toBe(true);
    expect(resolved.missingQuestionIds).toEqual([]);
    expect(resolved.questions.map((question) => question.id)).toEqual(questionIds);
  });

  it("is deterministic per attempt seed and varies the presentation order", () => {
    const first = selectTimedExamQuestionIds("attempt-a");
    const repeated = selectTimedExamQuestionIds("attempt-a");
    const second = selectTimedExamQuestionIds("attempt-b");

    expect(repeated).toEqual(first);
    expect(second).not.toEqual(first);
    expect(second).toHaveLength(60);
    expect(new Set(second).size).toBe(60);
  });

  it("uses a timed-exam-specific fingerprint and reports missing content", () => {
    expect(timedExamContentFingerprint).toContain(contentFingerprint);
    expect(timedExamContentFingerprint).toContain("timed-exam-v1");
    expect(timedExamContentFingerprint).toContain("60x120");

    const resolved = resolveTimedExamQuestions(["not-a-reviewed-question"]);

    expect(resolved.questions).toEqual([]);
    expect(resolved.missingQuestionIds).toEqual(["not-a-reviewed-question"]);
  });
});
