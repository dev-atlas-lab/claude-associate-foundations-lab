import { describe, expect, it } from "vitest";
import {
  mockExamDefinition,
  mockExamPools,
  mockExamQuestions,
  mockExamSummary,
} from "../content/mock-exam";
import { questionBankEntries, primaryBlueprint } from "../content";
import { selectMockExamQuestions } from "../domain";

describe("blueprint-weighted mock exam selection", () => {
  it("allocates by weight without duplicating questions", () => {
    const selection = selectMockExamQuestions(
      [
        { domainId: "one", weightPercent: 50, questionIds: ["a1", "a2", "a3"] },
        { domainId: "two", weightPercent: 50, questionIds: ["b1", "b2", "b3"] },
      ],
      4,
    );

    expect(selection.selectedQuestionIds).toHaveLength(4);
    expect(new Set(selection.selectedQuestionIds).size).toBe(4);
    expect(selection.shortfall).toBe(0);
    expect(selection.allocations.map((allocation) => allocation.allocated)).toEqual([2, 2]);
  });

  it("caps a domain at its available items and reports the shortfall", () => {
    const selection = selectMockExamQuestions(
      [
        { domainId: "small", weightPercent: 50, questionIds: ["a1"] },
        { domainId: "large", weightPercent: 50, questionIds: ["b1", "b2", "b3"] },
      ],
      10,
    );

    expect(selection.selectedQuestionIds).toHaveLength(4);
    expect(selection.shortfall).toBe(6);
    expect(selection.allocations).toEqual([
      { domainId: "small", weightPercent: 50, available: 1, allocated: 1 },
      { domainId: "large", weightPercent: 50, available: 3, allocated: 3 },
    ]);
  });

  it("is deterministic and deduplicates a question claimed by two pools", () => {
    const pools = [
      { domainId: "one", weightPercent: 70, questionIds: ["a1", "shared"] },
      { domainId: "two", weightPercent: 30, questionIds: ["shared", "b1"] },
    ];
    const first = selectMockExamQuestions(pools, 3);
    const second = selectMockExamQuestions(pools, 3);

    expect(first).toEqual(second);
    expect(new Set(first.selectedQuestionIds).size).toBe(first.selectedQuestionIds.length);
    expect(first.selectedQuestionIds).not.toContain(undefined);
  });

  it("rejects an invalid requested count", () => {
    expect(() => selectMockExamQuestions([], 0)).toThrow(RangeError);
    expect(() => selectMockExamQuestions([], 1.5)).toThrow(RangeError);
  });
});

describe("mock exam preview definition", () => {
  it("uses the verified format, reviewed items, and reports the shortfall", () => {
    const requested = primaryBlueprint.format.itemCount ?? 0;

    expect(requested).toBe(60);
    expect(mockExamSummary.requestedItemCount).toBe(requested);
    expect(mockExamSummary.selectedItemCount).toBe(mockExamSummary.allocations.reduce(
      (total, allocation) => total + allocation.allocated,
      0,
    ));
    expect(mockExamSummary.shortfall).toBe(requested - mockExamSummary.selectedItemCount);
    expect(mockExamSummary.selectedItemCount).toBe(questionBankEntries.length);
    expect(mockExamSummary.domainsWithItems).toBe(6);

    const reviewedIds = new Set(questionBankEntries.map((entry) => entry.question.id));

    expect(new Set(mockExamDefinition.questionIds).size).toBe(
      mockExamDefinition.questionIds.length,
    );
    expect(mockExamDefinition.questionIds.every((questionId) => reviewedIds.has(questionId))).toBe(
      true,
    );
    expect(mockExamQuestions.map((question) => question.id)).toEqual(
      mockExamDefinition.questionIds,
    );
  });

  it("keeps a zero-availability domain visible in the allocation", () => {
    const emptyDomain = mockExamSummary.allocations.find(
      (allocation) => allocation.available === 0,
    );

    expect(emptyDomain).toBeDefined();
    expect(emptyDomain?.allocated).toBe(0);
    expect(mockExamPools.some((pool) => pool.questionIds.length === 0)).toBe(true);
  });
});
