import {
  assessmentPolicySchema,
  selectTimedExamQuestions,
  type AssessmentPolicy,
  type MockExamSelection,
  type Question,
} from "../domain";
import { contentFingerprint } from "./fingerprint";
import { getQuestion, primaryBlueprint, questionBankEntries } from "./index";
import { mockExamPools } from "./mock-exam";

/**
 * Configuration for the timed CCAO-F simulation.
 *
 * The item count and duration come from the verified blueprint, not from
 * copy-pasted constants. The question pool is the same reviewed bank used by the
 * untimed preview; draft items can never enter the bank registry.
 */

function requiredFormatNumber(value: number | undefined, label: string): number {
  if (value === undefined) {
    throw new Error(`the verified blueprint must state the ${label}`);
  }

  return value;
}

export const timedExamAssessmentId = "mock-exam-timed";
export const timedExamBlueprintId = primaryBlueprint.id;
export const timedExamRequestedItemCount = requiredFormatNumber(
  primaryBlueprint.format.itemCount,
  "item count",
);
export const timedExamDurationMinutes = requiredFormatNumber(
  primaryBlueprint.format.timeLimitMinutes,
  "time limit",
);

export const timedExamPolicy: AssessmentPolicy = assessmentPolicySchema.parse({
  scoring: "all-or-nothing",
  allowAnswerChangesBeforeSubmit: true,
});

/**
 * A timed-exam-specific compatibility fingerprint. It starts from the shared
 * content fingerprint (questions, keys, mappings, weights, assessments) and adds
 * the simulation configuration. It is deliberately separate from
 * `cfl.study.v1`, so this feature cannot invalidate Practice attempts.
 */
export const timedExamContentFingerprint = [
  contentFingerprint,
  `timed-exam-v1`,
  `${timedExamRequestedItemCount}x${timedExamDurationMinutes}`,
  timedExamAssessmentId,
].join("::");

/**
 * Availability is independent of the attempt seed: allocation counts depend on
 * weights and pool sizes, while the seed only chooses which reviewed items fill
 * the slots.
 */
export const timedExamAvailability: MockExamSelection = selectTimedExamQuestions(
  mockExamPools,
  timedExamRequestedItemCount,
  "timed-exam-availability",
);

export const timedExamEligibility = {
  requestedItemCount: timedExamRequestedItemCount,
  durationMinutes: timedExamDurationMinutes,
  availableItemCount: timedExamAvailability.allocations.reduce(
    (total, allocation) => total + allocation.available,
    0,
  ),
  selectedItemCount: timedExamAvailability.selectedQuestionIds.length,
  shortfall: Math.max(
    0,
    timedExamRequestedItemCount - timedExamAvailability.selectedQuestionIds.length,
  ),
  allocations: timedExamAvailability.allocations,
  reviewedBankSize: questionBankEntries.length,
};

/**
 * Select the attempt's 60 items and presentation order. The seed is the attempt
 * id, so the same persisted attempt always reproduces the same order, while a
 * new attempt gets a different (still deterministic) selection.
 */
export function selectTimedExamQuestionIds(seed: string): string[] {
  return selectTimedExamQuestions(
    mockExamPools,
    timedExamRequestedItemCount,
    seed,
  ).selectedQuestionIds;
}

export interface ResolvedTimedExamContent {
  questions: Question[];
  questionById: ReadonlyMap<string, Question>;
  missingQuestionIds: string[];
}

export function resolveTimedExamQuestions(
  questionIds: readonly string[],
): ResolvedTimedExamContent {
  const questions: Question[] = [];
  const questionById = new Map<string, Question>();
  const missingQuestionIds: string[] = [];

  for (const questionId of questionIds) {
    const question = getQuestion(questionId);

    if (!question) {
      missingQuestionIds.push(questionId);
      continue;
    }

    questions.push(question);
    questionById.set(question.id, question);
  }

  return { questions, questionById, missingQuestionIds };
}

/** Resolve the full pool once so the UI can validate loaded attempts. */
export const timedExamQuestionById: ReadonlyMap<string, Question> = new Map(
  questionBankEntries.map((entry) => [entry.question.id, entry.question]),
);

export function getTimedExamQuestion(questionId: string): Question | undefined {
  return timedExamQuestionById.get(questionId);
}
