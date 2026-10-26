import {
  contentPackSchema,
  type AssessmentDefinition,
  type Lesson,
  type Question,
  type Source,
} from "../domain";
import {
  anthropicProvider,
  associateFoundationsBlueprint,
  associateFoundationsCertification,
  contextWindowLesson,
  contextWindowSampleAssessment,
  domainTwoOutputValidationAssessment,
  domainTwoQuestionBank,
  evaluationBasicsLesson,
  glossaryEntries,
  plannedLessons as plannedLessonData,
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
  lessons: [contextWindowLesson, evaluationBasicsLesson],
  questionBank: domainTwoQuestionBank,
  plannedLessons: plannedLessonData,
  assessments: [contextWindowSampleAssessment, domainTwoOutputValidationAssessment],
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
