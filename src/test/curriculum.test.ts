import { describe, expect, it } from "vitest";
import { curriculumDisclaimer } from "../features/curriculum/domains";
import { contextWindowLesson } from "../features/curriculum/lessons/context-window";
import { publishedLessons, plannedLessons } from "../features/curriculum/curriculum";
import { lessonOutline } from "../features/curriculum/outline";
import { lessonSchema } from "../features/curriculum/types";

describe("curriculum data validation", () => {
  it("accepts the published sample lesson", () => {
    expect(lessonSchema.safeParse(contextWindowLesson).success).toBe(true);
  });

  it("rejects a knowledge check whose correct answer is not an option", () => {
    const broken = {
      ...contextWindowLesson,
      knowledgeCheck: {
        ...contextWindowLesson.knowledgeCheck,
        correctOptionId: "not-an-option",
      },
    };

    expect(lessonSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a lesson with no objectives", () => {
    const broken = { ...contextWindowLesson, objectives: [] };

    expect(lessonSchema.safeParse(broken).success).toBe(false);
  });

  it("keeps published and planned lesson ids unique", () => {
    const publishedIds = publishedLessons.map((lesson) => lesson.id);
    const plannedIds = plannedLessons.map((lesson) => lesson.id);

    expect(new Set(publishedIds).size).toBe(publishedIds.length);
    expect(new Set(plannedIds).size).toBe(plannedIds.length);
    expect(plannedIds.some((id) => publishedIds.includes(id))).toBe(false);
  });

  it("builds a unique outline that points at real anchors", () => {
    const outline = lessonOutline(contextWindowLesson);
    const ids = outline.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("lesson-objectives");
    expect(ids).toContain("lesson-check");
    expect(ids).toContain("lesson-summary");
  });

  it("cites verified https sources and states the curriculum is unverified", () => {
    for (const lesson of publishedLessons) {
      for (const source of lesson.sources) {
        expect(source.url.startsWith("https://")).toBe(true);
      }
      expect(lesson.verificationNote.length).toBeGreaterThan(0);
    }

    expect(curriculumDisclaimer).toMatch(/unverified/i);
  });
});
