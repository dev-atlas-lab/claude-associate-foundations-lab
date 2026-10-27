import {
  contentPackSchema,
  type AssessmentDefinition,
  type Domain,
  type Lesson,
  type Question,
  type Source,
} from "../domain";
import {
  anthropicProvider,
  associateFoundationsBlueprint,
  associateFoundationsCertification,
  configurationBasicsLesson,
  contextWindowLesson,
  contextWindowSampleAssessment,
  domainFiveConfigurationAssessment,
  domainFourWorkflowAssessment,
  domainOnePromptingAssessment,
  domainSevenTroubleshootingAssessment,
  domainSixGovernanceAssessment,
  domainThreeContextAssessment,
  domainTwoOutputValidationAssessment,
  evaluationBasicsLesson,
  glossaryEntries,
  mixedFoundationsAssessment,
  plannedLessons as plannedLessonData,
  practiceSets as practiceSetData,
  promptStructureLesson,
  reviewedQuestionBank,
} from "./certifications/claude-associate-foundations";
import { sources } from "./sources";

/**
 * The registry is validated as a whole at import time: ids, weights, source
 * references, objective references, and question answers must all agree.
 */
export const contentPack = contentPackSchema.parse({
  providers: [anthropicProvider],
  certifications: [associateFoundationsCertification],
  blueprints: [associateFoundationsBlueprint],
  sources,
  lessons: [
    contextWindowLesson,
    evaluationBasicsLesson,
    configurationBasicsLesson,
    promptStructureLesson,
  ],
  questionBank: reviewedQuestionBank,
  plannedLessons: plannedLessonData,
  assessments: [
    contextWindowSampleAssessment,
    domainOnePromptingAssessment,
    domainTwoOutputValidationAssessment,
    domainThreeContextAssessment,
    domainFourWorkflowAssessment,
    domainFiveConfigurationAssessment,
    domainSixGovernanceAssessment,
    domainSevenTroubleshootingAssessment,
    mixedFoundationsAssessment,
  ],
  practiceSets: practiceSetData,
  glossary: glossaryEntries,
});

export const primaryCertification = contentPack.certifications[0]!;
export const primaryProvider = contentPack.providers[0]!;
export const primaryBlueprint = contentPack.blueprints[0]!;

export const publishedLessons: Lesson[] = contentPack.lessons
  .filter((lesson) => lesson.contentStatus === "published")
  .sort((left, right) => left.order - right.order);

export const glossary = contentPack.glossary;
export const plannedLessons = contentPack.plannedLessons;
export const assessments = contentPack.assessments;

/** Questions that belong to lessons, including design samples. */
export const lessonQuestions: Question[] = contentPack.lessons.flatMap(
  (lesson) => lesson.questions,
);

/** Reviewed bank entries with exam mapping and verification metadata. */
export const questionBankEntries = contentPack.questionBank;

/** The reviewed question bank, without lesson-only samples. */
export const questionBank: Question[] = questionBankEntries.map((entry) => entry.question);

/** Every authored question that an assessment may resolve. */
export const allQuestions: Question[] = [...lessonQuestions, ...questionBank];

const sourcesById = new Map(contentPack.sources.map((source) => [source.id, source]));
const questionsById = new Map(allQuestions.map((question) => [question.id, question]));
const questionBankEntriesById = new Map(
  questionBankEntries.map((entry) => [entry.question.id, entry]),
);
const assessmentsById = new Map(
  contentPack.assessments.map((assessment) => [assessment.id, assessment]),
);

export interface PracticeSetSummary {
  assessment: AssessmentDefinition;
  domains: Domain[];
  objectiveIds: string[];
  questionCount: number;
  singleChoiceCount: number;
  multipleResponseCount: number;
}

/**
 * Registry-driven practice sets. The content pack has already proved that every
 * question is a reviewed bank item and that the declared domains match the
 * question mappings.
 */
export const practiceSets: PracticeSetSummary[] = contentPack.practiceSets.map((practiceSet) => {
  const assessment = assessmentsById.get(practiceSet.assessmentId);

  if (!assessment) {
    throw new Error(`practice set "${practiceSet.assessmentId}" has no assessment definition`);
  }

  const domains = practiceSet.domainIds.flatMap((domainId) => {
    const domain = getDomain(domainId);
    return domain ? [domain] : [];
  });
  const entries = assessment.questionIds.flatMap((questionId) => {
    const entry = questionBankEntriesById.get(questionId);
    return entry ? [entry] : [];
  });
  const objectiveIds = [...new Set(entries.flatMap((entry) => entry.examMapping.objectiveIds))];
  const questions = assessment.questionIds.flatMap((questionId) => {
    const question = questionsById.get(questionId);
    return question ? [question] : [];
  });

  return {
    assessment,
    domains,
    objectiveIds,
    questionCount: questions.length,
    singleChoiceCount: questions.filter((question) => question.type === "single-choice").length,
    multipleResponseCount: questions.filter(
      (question) => question.type === "multiple-response",
    ).length,
  };
});

export function getPracticeSet(
  assessmentId: string | undefined,
): PracticeSetSummary | undefined {
  if (!assessmentId) {
    return undefined;
  }

  return practiceSets.find(
    (practiceSet) => practiceSet.assessment.id === assessmentId,
  );
}

export function getLesson(id: string | undefined): Lesson | undefined {
  if (!id) {
    return undefined;
  }

  return publishedLessons.find((lesson) => lesson.id === id);
}

export function getLessonNeighbours(id: string): {
  previous?: Lesson;
  next?: Lesson;
  plannedNext?: (typeof contentPack.plannedLessons)[number];
} {
  const index = publishedLessons.findIndex((lesson) => lesson.id === id);

  if (index === -1) {
    return {};
  }

  return {
    previous: publishedLessons[index - 1],
    next: publishedLessons[index + 1],
    plannedNext: index === publishedLessons.length - 1 ? contentPack.plannedLessons[0] : undefined,
  };
}

export function getQuestion(id: string | undefined): Question | undefined {
  if (!id) {
    return undefined;
  }

  return questionsById.get(id);
}

/** Return the reviewed bank metadata for a question, if it has any. */
export function getQuestionBankEntry(id: string | undefined) {
  if (!id) {
    return undefined;
  }

  return questionBankEntriesById.get(id);
}

export function getAssessment(id: string | undefined): AssessmentDefinition | undefined {
  if (!id) {
    return undefined;
  }

  return assessmentsById.get(id);
}

/** Resolve assessment question ids in authored order. Missing ids are omitted. */
export function getAssessmentQuestions(assessment: AssessmentDefinition): Question[] {
  return assessment.questionIds.flatMap((questionId) => {
    const question = questionsById.get(questionId);
    return question ? [question] : [];
  });
}

export function getSource(id: string): Source | undefined {
  return sourcesById.get(id);
}

export function getCertification(id: string) {
  return contentPack.certifications.find((certification) => certification.id === id);
}

export function getBlueprint(id: string) {
  return contentPack.blueprints.find((blueprint) => blueprint.id === id);
}

/** Resolve source references in the order the content author listed them. */
export function getSources(ids: string[]): Source[] {
  return ids.flatMap((id) => {
    const source = sourcesById.get(id);
    return source ? [source] : [];
  });
}

export function getDomain(domainId: string) {
  for (const blueprint of contentPack.blueprints) {
    const domain = blueprint.domains.find((candidate) => candidate.id === domainId);

    if (domain) {
      return domain;
    }
  }

  return undefined;
}

export function getObjective(objectiveId: string) {
  for (const blueprint of contentPack.blueprints) {
    for (const domain of blueprint.domains) {
      const objective = domain.objectives.find((candidate) => candidate.id === objectiveId);

      if (objective) {
        return { blueprint, domain, objective };
      }
    }
  }

  return undefined;
}

export function getDomainForObjective(objectiveId: string): Domain | undefined {
  return getObjective(objectiveId)?.domain;
}
