import { describe, expect, it } from "vitest";
import {
  contentPackSchema,
  questionBankEntrySchema,
  type QuestionBankEntry,
} from "../domain";
import {
  contentPack,
  getAssessment,
  getAssessmentQuestions,
  getDomain,
  getObjective,
  getQuestionBankEntry,
  questionBank,
  questionBankEntries,
} from "../content";

const assessment = getAssessment("domain-2-output-validation-set");
const firstEntry = questionBankEntries[0]!;

function withFirstEntry(overrides: Partial<QuestionBankEntry>): QuestionBankEntry {
  return { ...firstEntry, ...overrides };
}

const vietnameseDiacriticPattern =
  /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;

describe("reviewed question bank", () => {
  it("publishes twenty-four valid bank entries and runnable assessments", () => {
    expect(questionBankEntries).toHaveLength(24);
    expect(questionBank).toHaveLength(24);
    expect(assessment).toBeDefined();
    expect(assessment?.questionIds).toHaveLength(14);
    expect(assessment?.policy).toEqual({
      scoring: "all-or-nothing",
      allowAnswerChangesBeforeSubmit: true,
    });
    expect(contentPackSchema.safeParse(contentPack).success).toBe(true);
    expect(questionBankEntrySchema.safeParse(firstEntry).success).toBe(true);
  });

  it("maps every entry to a verified objective and gives each Domain 2 objective two items", () => {
    const domainTwoObjectiveIds = new Set(
      getDomain("output-evaluation-validation")?.objectives.map((objective) => objective.id) ?? [],
    );
    const counts = new Map<string, number>();

    for (const entry of questionBankEntries) {
      expect(entry.examMapping.status).toBe("verified");
      expect(entry.examMapping.objectiveIds).toHaveLength(1);

      const objectiveId = entry.examMapping.objectiveIds[0]!;
      const resolved = getObjective(objectiveId);

      expect(resolved).toBeDefined();

      if (domainTwoObjectiveIds.has(objectiveId)) {
        counts.set(objectiveId, (counts.get(objectiveId) ?? 0) + 1);
      }
    }

    expect([...counts.entries()].sort()).toEqual([
      ["output-edit-adapt", 2],
      ["output-evaluate-accuracy", 2],
      ["output-fact-check", 2],
      ["output-format-selection", 2],
      ["output-human-review", 2],
      ["output-identify-hallucinations", 4],
    ]);
  });

  it("covers six of the seven domains and leaves Domain 5 visibly uncovered", () => {
    const domainIds = new Set(
      questionBankEntries.map((entry) => {
        const objectiveId = entry.examMapping.objectiveIds[0]!;
        return getObjective(objectiveId)?.domain.id;
      }),
    );

    expect(domainIds.size).toBe(6);
    expect(domainIds.has("configuration-knowledge-management")).toBe(false);
  });

  it("includes both single-choice and multiple-response items", () => {
    const types = questionBank.map((question) => question.type);

    expect(types.filter((type) => type === "single-choice")).toHaveLength(13);
    expect(types.filter((type) => type === "multiple-response")).toHaveLength(11);
    expect(new Set(questionBank.map((question) => question.id)).size).toBe(questionBank.length);
  });

  it("resolves every assessment question in authored order", () => {
    const resolved = assessment ? getAssessmentQuestions(assessment) : [];

    expect(resolved.map((question) => question.id)).toEqual(assessment?.questionIds);
    expect(resolved).toHaveLength(14);
    expect(resolved.every((question) => getQuestionBankEntry(question.id) !== undefined)).toBe(
      true,
    );
    expect(getQuestionBankEntry("context-window-root-cause")).toBeUndefined();
  });

  it("keeps learner-facing English text free of Vietnamese diacritics", () => {
    for (const question of questionBank) {
      expect(question.stem).not.toMatch(vietnameseDiacriticPattern);

      for (const choice of question.choices) {
        expect(choice.text).not.toMatch(vietnameseDiacriticPattern);
      }
    }
  });

  it("provides a Vietnamese explanation for the answer and every distractor", () => {
    for (const question of questionBank) {
      expect(question.correctExplanation).toMatch(vietnameseDiacriticPattern);
      expect(question.choices).toHaveLength(new Set(question.choices.map((choice) => choice.id)).size);

      for (const choice of question.choices) {
        expect(choice.explanation).toMatch(vietnameseDiacriticPattern);
      }

      expect(question.correctChoiceIds.length).toBe(
        question.type === "single-choice" ? 1 : 3,
      );
      expect(question.choices.length).toBeGreaterThan(question.correctChoiceIds.length);
    }
  });

  it("cites only registered sources and includes those sources in verification", () => {
    const knownSourceIds = new Set(contentPack.sources.map((source) => source.id));

    for (const entry of questionBankEntries) {
      expect(entry.contentStatus).toBe("published");
      expect(entry.verification.status).toBe("verified");
      expect(entry.verification.checkedAt).toBe("2026-10-26");

      for (const sourceId of entry.question.sourceIds) {
        expect(knownSourceIds.has(sourceId)).toBe(true);
        expect(entry.verification.sourceIds).toContain(sourceId);
      }

      for (const sourceId of entry.verification.sourceIds) {
        expect(knownSourceIds.has(sourceId)).toBe(true);
      }
    }

    expect(
      contentPack.sources.some(
        (source) => source.id === "anthropic-reduce-hallucinations-doc",
      ),
    ).toBe(true);
    expect(
      contentPack.sources.some((source) => source.id === "anthropic-evaluation-docs"),
    ).toBe(true);

    for (const sourceId of [
      "anthropic-prompting-best-practices",
      "anthropic-structured-outputs-doc",
      "anthropic-artifacts-doc",
      "anthropic-claude-constitution",
    ]) {
      expect(contentPack.sources.some((source) => source.id === sourceId)).toBe(true);
    }
  });
});

describe("question-bank cross-references", () => {
  it("rejects an unmapped bank entry", () => {
    expect(
      questionBankEntrySchema.safeParse({
        ...firstEntry,
        examMapping: {
          status: "unmapped",
          objectiveIds: [],
          note: "Unmapped items belong in lessons.",
        },
      }).success,
    ).toBe(false);
  });

  it("rejects a verified mapping whose content is not verified", () => {
    expect(
      questionBankEntrySchema.safeParse({
        ...firstEntry,
        verification: { ...firstEntry.verification, status: "partially-verified" },
      }).success,
    ).toBe(false);
  });

  it("rejects question sources that are not recorded in the review", () => {
    expect(
      questionBankEntrySchema.safeParse({
        ...firstEntry,
        verification: { ...firstEntry.verification, sourceIds: ["ccao-f-exam-guide-v1"] },
      }).success,
    ).toBe(false);
  });

  it("rejects a bank question that duplicates a lesson question id", () => {
    const lessonQuestionId = contentPack.lessons[0]!.questions[0]!.id;
    const duplicate = withFirstEntry({
      question: { ...firstEntry.question, id: lessonQuestionId },
    });

    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        questionBank: [...contentPack.questionBank, duplicate],
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown objective id", () => {
    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        questionBank: [
          withFirstEntry({
            examMapping: {
              status: "verified",
              objectiveIds: ["objective-that-does-not-exist"],
              note: "Broken objective reference.",
            },
          }),
          ...contentPack.questionBank.slice(1),
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects a blueprint or certification mismatch", () => {
    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        questionBank: [
          withFirstEntry({ blueprintId: "blueprint-that-does-not-exist" }),
          ...contentPack.questionBank.slice(1),
        ],
      }).success,
    ).toBe(false);

    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        questionBank: [
          withFirstEntry({
            certificationId: "certification-that-does-not-exist",
          }),
          ...contentPack.questionBank.slice(1),
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown verification source", () => {
    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        questionBank: [
          withFirstEntry({
            verification: {
              ...firstEntry.verification,
              sourceIds: [...firstEntry.verification.sourceIds, "missing-source"],
            },
          }),
          ...contentPack.questionBank.slice(1),
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects a lesson reference to a question outside the reviewed bank", () => {
    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        lessons: contentPack.lessons.map((lesson, index) =>
          index === 1
            ? { ...lesson, relatedQuestionIds: ["question-that-does-not-exist"] }
            : lesson,
        ),
      }).success,
    ).toBe(false);
  });
});
