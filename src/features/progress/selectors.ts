import {
  calculateAttemptResult,
  countReviewResolutions,
  deriveReviewItems,
  type Blueprint,
  type Question,
  type QuestionBankEntry,
  type StudyState,
} from "../../domain";

export interface DomainBankCoverage {
  domainId: string;
  code: string;
  title: string;
  weightPercent: number;
  itemCount: number;
  objectivesCovered: number;
  objectivesTotal: number;
}

export interface DomainPerformance {
  domainId: string;
  code: string;
  title: string;
  weightPercent: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  accuracyOnAnswered?: number;
}

export interface ProgressSummary {
  bank: {
    totalItems: number;
    singleChoiceItems: number;
    multipleResponseItems: number;
    objectivesCovered: number;
    objectivesTotal: number;
    domainsWithItems: number;
    domains: DomainBankCoverage[];
  };
  personal: {
    submittedAttempts: number;
    answeredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unansweredQuestions: number;
    accuracyOnAnswered?: number;
    rawPercentage?: number;
    lastSubmittedAt?: string;
    domains: DomainPerformance[];
  };
  review: {
    unresolved: number;
    resolved: number;
  };
}

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}

function percentage(numerator: number, denominator: number): number | undefined {
  if (denominator === 0) {
    return undefined;
  }

  return roundPercentage((numerator / denominator) * 100);
}

/**
 * Progress separates what the bank contains from what this learner has done.
 * Bank coverage is derived from the reviewed registry; personal performance is
 * derived from submitted attempts. Neither is stored as a duplicate metric.
 */
export function deriveProgressSummary(
  state: StudyState,
  bankEntries: readonly QuestionBankEntry[],
  blueprint: Blueprint,
  questionById: ReadonlyMap<string, Question>,
): ProgressSummary {
  const domainIdByObjectiveId = new Map<string, string>();

  for (const domain of blueprint.domains) {
    for (const objective of domain.objectives) {
      domainIdByObjectiveId.set(objective.id, domain.id);
    }
  }

  const bankByQuestionId = new Map(
    bankEntries.map((entry) => [entry.question.id, entry]),
  );
  const bankDomains = blueprint.domains.map<DomainBankCoverage>((domain) => ({
    domainId: domain.id,
    code: domain.code,
    title: domain.title,
    weightPercent: domain.weightPercent ?? 0,
    itemCount: 0,
    objectivesCovered: 0,
    objectivesTotal: domain.objectives.length,
  }));
  const bankDomainById = new Map(bankDomains.map((domain) => [domain.domainId, domain]));
  const coveredObjectiveIds = new Set<string>();

  for (const entry of bankEntries) {
    for (const objectiveId of entry.examMapping.objectiveIds) {
      const domainId = domainIdByObjectiveId.get(objectiveId);

      if (!domainId) {
        continue;
      }

      coveredObjectiveIds.add(objectiveId);
    }

    const primaryObjectiveId = entry.examMapping.objectiveIds[0];
    const primaryDomainId = primaryObjectiveId
      ? domainIdByObjectiveId.get(primaryObjectiveId)
      : undefined;
    const domain = primaryDomainId ? bankDomainById.get(primaryDomainId) : undefined;

    if (domain) {
      domain.itemCount += 1;
    }
  }

  for (const domain of bankDomains) {
    const domainDefinition = blueprint.domains.find(
      (candidate) => candidate.id === domain.domainId,
    );
    domain.objectivesCovered =
      domainDefinition?.objectives.filter((objective) =>
        coveredObjectiveIds.has(objective.id),
      ).length ?? 0;
  }

  const performanceDomains = blueprint.domains.map<DomainPerformance>((domain) => ({
    domainId: domain.id,
    code: domain.code,
    title: domain.title,
    weightPercent: domain.weightPercent ?? 0,
    attemptedQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    unansweredQuestions: 0,
    accuracyOnAnswered: undefined,
  }));
  const performanceDomainById = new Map(
    performanceDomains.map((domain) => [domain.domainId, domain]),
  );

  let submittedAttempts = 0;
  let answeredQuestions = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unansweredQuestions = 0;
  let lastSubmittedAt: string | undefined;

  for (const attempt of state.attempts) {
    if (attempt.session.status !== "submitted" || attempt.session.submittedAt === undefined) {
      continue;
    }

    submittedAttempts += 1;

    if (lastSubmittedAt === undefined || attempt.session.submittedAt > lastSubmittedAt) {
      lastSubmittedAt = attempt.session.submittedAt;
    }

    const result = calculateAttemptResult(attempt, questionById);

    for (const score of result.questions) {
      if (score.outcome === "unanswered") {
        unansweredQuestions += 1;
      } else {
        answeredQuestions += 1;
      }

      if (score.outcome === "correct") {
        correctAnswers += 1;
      } else if (score.outcome === "incorrect") {
        incorrectAnswers += 1;
      }

      const entry = bankByQuestionId.get(score.questionId);
      const objectiveId = entry?.examMapping.objectiveIds[0];
      const domainId = objectiveId ? domainIdByObjectiveId.get(objectiveId) : undefined;
      const domain = domainId ? performanceDomainById.get(domainId) : undefined;

      if (!domain) {
        continue;
      }

      domain.attemptedQuestions += 1;

      if (score.outcome === "correct") {
        domain.correctAnswers += 1;
      } else if (score.outcome === "incorrect") {
        domain.incorrectAnswers += 1;
      } else {
        domain.unansweredQuestions += 1;
      }
    }
  }

  for (const domain of performanceDomains) {
    domain.accuracyOnAnswered = percentage(
      domain.correctAnswers,
      domain.attemptedQuestions - domain.unansweredQuestions,
    );
  }

  const totalQuestions = correctAnswers + incorrectAnswers + unansweredQuestions;

  return {
    bank: {
      totalItems: bankEntries.length,
      singleChoiceItems: bankEntries.filter(
        (entry) => entry.question.type === "single-choice",
      ).length,
      multipleResponseItems: bankEntries.filter(
        (entry) => entry.question.type === "multiple-response",
      ).length,
      objectivesCovered: coveredObjectiveIds.size,
      objectivesTotal: blueprint.domains.reduce(
        (total, domain) => total + domain.objectives.length,
        0,
      ),
      domainsWithItems: bankDomains.filter((domain) => domain.itemCount > 0).length,
      domains: bankDomains,
    },
    personal: {
      submittedAttempts,
      answeredQuestions,
      correctAnswers,
      incorrectAnswers,
      unansweredQuestions,
      accuracyOnAnswered: percentage(correctAnswers, answeredQuestions),
      rawPercentage: percentage(correctAnswers, totalQuestions),
      lastSubmittedAt,
      domains: performanceDomains,
    },
    review: {
      unresolved: deriveReviewItems(state, questionById).length,
      resolved: countReviewResolutions(state),
    },
  };
}
