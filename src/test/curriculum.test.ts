import { describe, expect, it } from "vitest";
import {
  contentPack,
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
    expect(primaryBlueprint.format.itemCount).toBe(60);
    expect(primaryBlueprint.format.timeLimitMinutes).toBe(120);
    expect(primaryBlueprint.format.passingScore?.cutScore).toBe(720);
  });

  it("returns no neighbour for an unknown lesson and real neighbours for a known one", () => {
    expect(getLesson("not-a-lesson")).toBeUndefined();
    expect(getLessonNeighbours("not-a-lesson")).toEqual({});
    expect(getLessonNeighbours("context-window")).toMatchObject({
      next: getLesson("evaluation-basics"),
    });
    expect(getLessonNeighbours("evaluation-basics")).toMatchObject({
      previous: getLesson("context-window"),
      next: getLesson("configuration-basics"),
    });
    expect(getLessonNeighbours("prompt-structure")).toMatchObject({
      previous: getLesson("configuration-basics"),
      plannedNext: contentPack.plannedLessons[0],
    });
  });

  it("publishes one reviewed lesson for the Context Window sample and three domain lessons", () => {
    const ids = publishedLessons.map((lesson) => lesson.id);

    expect(ids).toEqual([
      "context-window",
      "evaluation-basics",
      "configuration-basics",
      "prompt-structure",
    ]);
    expect(getLesson("configuration-basics")?.examMapping.status).toBe("verified");
    expect(getLesson("prompt-structure")?.examMapping.status).toBe("verified");
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
