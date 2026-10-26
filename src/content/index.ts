import { contentPackSchema, type Lesson, type Source } from "../domain";
import {
  anthropicProvider,
  associateFoundationsBlueprint,
  associateFoundationsCertification,
  contextWindowLesson,
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
  lessons: [contextWindowLesson],
  plannedLessons: plannedLessonData,
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

const sourcesById = new Map(contentPack.sources.map((source) => [source.id, source]));

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
