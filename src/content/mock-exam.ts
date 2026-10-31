import {
  assessmentDefinitionSchema,
  selectMockExamQuestions,
  selectTimedExamQuestions,
  type AssessmentDefinition,
  type MockExamDomainPool,
  type MockExamSelection,
} from "../domain";
import type { Question } from "../domain/lesson";
import {
  getAssessmentQuestions,
  primaryBlueprint,
  questionBankEntries,
} from "./index";

/**
 * The mock-exam preview is derived from the reviewed bank, not authored as a
 * fixed 60-item form. Blueprint weights decide how the available items are
 * allocated; when the bank is too small, the shortfall is reported and no
 * duplicate or invented item is added.
 */
const domainIdByObjectiveId = new Map<string, string>();

for (const domain of primaryBlueprint.domains) {
  for (const objective of domain.objectives) {
    domainIdByObjectiveId.set(objective.id, domain.id);
  }
}

export const mockExamPools: MockExamDomainPool[] = primaryBlueprint.domains.map((domain) => ({
  domainId: domain.id,
  weightPercent: domain.weightPercent ?? 0,
  questionIds: questionBankEntries
    .filter((entry) =>
      entry.examMapping.objectiveIds.some(
        (objectiveId) => domainIdByObjectiveId.get(objectiveId) === domain.id,
      ),
    )
    .map((entry) => entry.question.id),
}));

const requestedItemCount = primaryBlueprint.format.itemCount;

if (requestedItemCount === undefined) {
  throw new Error("the verified blueprint must state the mock-exam item count");
}

export const mockExamSelection: MockExamSelection = selectMockExamQuestions(
  mockExamPools,
  requestedItemCount,
);

export const mockExamDefinition: AssessmentDefinition = assessmentDefinitionSchema.parse({
  id: "mock-exam-preview",
  title: "CCAO-F mock exam preview",
  description: `A blueprint-weighted preview using ${mockExamSelection.selectedQuestionIds.length} of the verified ${requestedItemCount}-item format. It contains only reviewed practice items, reports the missing ${mockExamSelection.shortfall} items honestly, and does not produce an official scaled score.`,
  questionIds: mockExamSelection.selectedQuestionIds,
  policy: {
    scoring: "all-or-nothing",
    allowAnswerChangesBeforeSubmit: true,
  },
});

export const mockExamQuestions = getAssessmentQuestions(mockExamDefinition);

if (mockExamQuestions.length !== mockExamDefinition.questionIds.length) {
  throw new Error("the mock-exam preview references a question that is not in the content registry");
}

export const mockExamSummary = {
  requestedItemCount,
  selectedItemCount: mockExamSelection.selectedQuestionIds.length,
  shortfall: mockExamSelection.shortfall,
  allocations: mockExamSelection.allocations,
  domainsWithItems: mockExamSelection.allocations.filter((allocation) => allocation.allocated > 0)
    .length,
};

/* ── Mock Exam Set 2 (Alternative Blueprint Permutation) ─────────────────── */

export const mockExamSet2Selection: MockExamSelection = selectTimedExamQuestions(
  mockExamPools,
  requestedItemCount,
  "ccao-f-mock-set-2",
);

export const mockExamSet2Definition: AssessmentDefinition = assessmentDefinitionSchema.parse({
  id: "mock-exam-preview-set-2",
  title: "CCAO-F mock exam preview (Set 2)",
  description: `Mock exam set 2 comprising 60 questions strictly distributed by official CCAO-F 7-domain weights, utilizing permutation items and backup questions from the 105-question bank for an independent full run.`,
  questionIds: mockExamSet2Selection.selectedQuestionIds,
  policy: {
    scoring: "all-or-nothing",
    allowAnswerChangesBeforeSubmit: true,
  },
});

export const mockExamSet2Questions = getAssessmentQuestions(mockExamSet2Definition);

if (mockExamSet2Questions.length !== mockExamSet2Definition.questionIds.length) {
  throw new Error("mock-exam set 2 references a question that is not in the content registry");
}

export const mockExamSet2Summary = {
  requestedItemCount,
  selectedItemCount: mockExamSet2Selection.selectedQuestionIds.length,
  shortfall: mockExamSet2Selection.shortfall,
  allocations: mockExamSet2Selection.allocations,
  domainsWithItems: mockExamSet2Selection.allocations.filter((allocation) => allocation.allocated > 0)
    .length,
};

export interface MockExamPresetInfo {
  id: "set-1" | "set-2";
  title: string;
  badge: string;
  description: string;
  seed: string;
  definition: AssessmentDefinition;
  selection: MockExamSelection;
  questions: readonly Question[];
  summary: typeof mockExamSummary;
}

export const mockExamPresets: readonly MockExamPresetInfo[] = [
  {
    id: "set-1",
    title: "Standard Mock Exam #1 (Set 1)",
    badge: "Set 1",
    description: "Standard simulation accurately balanced by the official CCAO-F 7 Domain weights.",
    seed: "ccao-f-mock-set-1",
    definition: mockExamDefinition,
    selection: mockExamSelection,
    questions: mockExamQuestions,
    summary: mockExamSummary,
  },
  {
    id: "set-2",
    title: "Alternative Mock Exam #2 (Set 2)",
    badge: "Set 2",
    description: "Second distinct permutation drawing backup items from the 105-item bank for comprehensive domain coverage.",
    seed: "ccao-f-mock-set-2",
    definition: mockExamSet2Definition,
    selection: mockExamSet2Selection,
    questions: mockExamSet2Questions,
    summary: mockExamSet2Summary,
  },
];
