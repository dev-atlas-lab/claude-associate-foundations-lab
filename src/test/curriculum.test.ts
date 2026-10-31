import { describe, expect, it } from "vitest";
import {
  getDomain,
  getLesson,
  getLessonNeighbours,
  getObjective,
  getQuestionBankEntry,
  getSources,
  plannedLessons,
  primaryBlueprint,
  publishedLessons,
} from "../content";
import { lessonOutline } from "../features/curriculum/outline";

describe("curriculum registry", () => {
  it("keeps published and planned lesson ids unique", () => {
    const publishedIds = publishedLessons.map((lesson) => lesson.id);
    const plannedIds = plannedLessons.map((lesson) => lesson.id);

    expect(new Set(publishedIds).size).toBe(publishedIds.length);
    expect(new Set(plannedIds).size).toBe(plannedIds.length);
    expect(plannedIds.some((id) => publishedIds.includes(id))).toBe(false);
  });

  it("builds a unique outline that points at real anchors", () => {
    const lesson = getLesson("context-window");
    expect(lesson).toBeDefined();

    const outline = lessonOutline(lesson!);
    const ids = outline.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("lesson-objectives");
    expect(ids).toContain("lesson-check");
    expect(ids).toContain("lesson-summary");
  });

  it("resolves every cited source to an HTTPS URL", () => {
    for (const lesson of publishedLessons) {
      const sources = getSources(lesson.sourceIds);

      expect(sources).toHaveLength(lesson.sourceIds.length);
      for (const source of sources) {
        expect(source.url.startsWith("https://")).toBe(true);
      }

      for (const sourceId of lesson.sourceIds) {
        expect(lesson.verification.sourceIds).toContain(sourceId);
      }

      for (const question of lesson.questions) {
        expect(getSources(question.sourceIds)).toHaveLength(question.sourceIds.length);
      }
    }
  });

  it("keeps the published sample explicitly unmapped", () => {
    for (const lesson of publishedLessons) {
      if (lesson.kind === "sample") {
        expect(lesson.examMapping.status).toBe("unmapped");
        expect(lesson.examMapping.objectiveIds).toEqual([]);
      }
    }
  });

  it("maps every planned lesson domain to a real blueprint domain", () => {
    for (const lesson of plannedLessons) {
      if (lesson.domainId) {
        expect(getDomain(lesson.domainId)).toBeDefined();
      }
    }
  });

  it("keeps official domain weights adding up to 100", () => {
    const total = primaryBlueprint.domains.reduce(
      (sum, domain) => sum + (domain.weightPercent ?? 0),
      0,
    );

    expect(total).toBe(100);
    expect(primaryBlueprint.domains.map((domain) => domain.weightPercent)).toEqual([
      14, 21, 12, 16, 12, 15, 10,
    ]);
    expect(primaryBlueprint.format.itemCount).toBe(60);
    expect(primaryBlueprint.format.timeLimitMinutes).toBe(120);
    expect(primaryBlueprint.format.passingScore?.cutScore).toBe(720);
  });

  it("returns no neighbour for an unknown lesson and real neighbours for a known one", () => {
    expect(getLesson("not-a-lesson")).toBeUndefined();
    expect(getLessonNeighbours("not-a-lesson")).toEqual({});
    expect(getLessonNeighbours("prompt-structure")).toMatchObject({
      previous: undefined,
      next: getLesson("evaluation-basics"),
    });
    expect(getLessonNeighbours("evaluation-basics")).toMatchObject({
      previous: getLesson("prompt-structure"),
      next: getLesson("product-selection"),
    });
    expect(getLessonNeighbours("configuration-basics")).toMatchObject({
      previous: getLesson("workflow-design"),
      next: getLesson("governance-responsible-use"),
    });
    expect(getLessonNeighbours("context-window")).toMatchObject({
      previous: getLesson("troubleshooting-optimization"),
      plannedNext: undefined,
    });
  });

  it("publishes seven domain lessons and one reviewed sample in blueprint domain order", () => {
    const ids = publishedLessons.map((lesson) => lesson.id);

    expect(ids).toEqual([
      "prompt-structure",
      "evaluation-basics",
      "product-selection",
      "workflow-design",
      "configuration-basics",
      "governance-responsible-use",
      "troubleshooting-optimization",
      "context-window",
    ]);
    expect(getLesson("configuration-basics")?.examMapping.status).toBe("verified");
    expect(getLesson("prompt-structure")?.examMapping.status).toBe("verified");
    expect(getLesson("product-selection")?.examMapping.status).toBe("verified");
    expect(getLesson("workflow-design")?.examMapping.status).toBe("verified");
    expect(getLesson("governance-responsible-use")?.examMapping.status).toBe("verified");
    expect(getLesson("troubleshooting-optimization")?.examMapping.status).toBe("verified");
  });

  it("maps all 30 verified objectives across all seven domains", () => {
    const mappedObjectiveIds = new Set(
      publishedLessons.flatMap((lesson) => lesson.examMapping.objectiveIds),
    );

    for (const domain of primaryBlueprint.domains) {
      for (const objective of domain.objectives) {
        expect(mappedObjectiveIds.has(objective.id)).toBe(true);
      }
    }
    expect(mappedObjectiveIds.size).toBe(30);
  });

  it("keeps every published lesson mapping and related practice resolvable", () => {
    for (const lesson of publishedLessons) {
      for (const objectiveId of lesson.examMapping.objectiveIds) {
        expect(getObjective(objectiveId)).toBeDefined();
      }

      for (const questionId of lesson.relatedQuestionIds) {
        expect(getQuestionBankEntry(questionId)?.examMapping.status).toBe("verified");
      }
    }
  });
});
