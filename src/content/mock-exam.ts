import {
  assessmentDefinitionSchema,
  selectMockExamQuestions,
  type AssessmentDefinition,
  type MockExamDomainPool,
  type MockExamSelection,
} from "../domain";
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
