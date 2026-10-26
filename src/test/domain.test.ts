import { describe, expect, it } from "vitest";
import {
  blueprintSchema,
  certificationSchema,
  contentPackSchema,
  lessonSchema,
  questionSchema,
  sourceSchema,
  verificationSchema,
} from "../domain";
import { contentPack, primaryBlueprint, primaryCertification, publishedLessons } from "../content";

const lesson = publishedLessons[0]!;
const question = lesson.questions[0]!;
const source = contentPack.sources[0]!;

describe("validated content", () => {
  it("accepts the verified certification and blueprint metadata", () => {
    expect(certificationSchema.safeParse(primaryCertification).success).toBe(true);
    expect(blueprintSchema.safeParse(primaryBlueprint).success).toBe(true);
    expect(primaryBlueprint.domains).toHaveLength(7);
    expect(
      primaryBlueprint.domains.reduce(
        (total, domain) => total + domain.objectives.length,
        0,
      ),
    ).toBe(30);
    expect(
      primaryBlueprint.domains.reduce((total, domain) => total + (domain.weightPercent ?? 0), 0),
    ).toBe(100);
  });

  it("accepts the published lesson and its single-choice question", () => {
    expect(lessonSchema.safeParse(lesson).success).toBe(true);
    expect(questionSchema.safeParse(question).success).toBe(true);
    expect(question.type).toBe("single-choice");
    expect(question.correctChoiceIds).toHaveLength(1);
  });

  it("accepts the whole content pack and every cross-reference", () => {
    expect(contentPackSchema.safeParse(contentPack).success).toBe(true);
  });
});

describe("question validation", () => {
  const validMultipleResponse = {
    id: "multiple-response-example",
    type: "multiple-response" as const,
    stem: "Which two actions reduce context noise? Select two.",
    choices: [
      { id: "a", text: "Retrieve only relevant sections.", explanation: "Đúng." },
      { id: "b", text: "Paste the whole handbook.", explanation: "Sai." },
      { id: "c", text: "Summarize older turns.", explanation: "Đúng." },
    ],
    correctChoiceIds: ["a", "c"],
    correctExplanation: "Hai lựa chọn này giảm nhiễu trong context window.",
    sourceIds: ["anthropic-context-windows-doc"],
  };

  it("accepts a multiple-response question with two valid correct choices", () => {
    expect(questionSchema.safeParse(validMultipleResponse).success).toBe(true);
  });

  it("rejects single-choice questions with zero or multiple correct choices", () => {
    expect(
      questionSchema.safeParse({
        ...question,
        correctChoiceIds: [],
      }).success,
    ).toBe(false);

    expect(
      questionSchema.safeParse({
        ...question,
        correctChoiceIds: ["b", "c"],
      }).success,
    ).toBe(false);
  });

  it("rejects multiple-response questions with fewer than two correct choices", () => {
    expect(
      questionSchema.safeParse({
        ...validMultipleResponse,
        correctChoiceIds: ["a"],
      }).success,
    ).toBe(false);
  });

  it("rejects multiple-response questions that leave no distractor", () => {
    expect(
      questionSchema.safeParse({
        ...validMultipleResponse,
        correctChoiceIds: ["a", "b", "c"],
      }).success,
    ).toBe(false);
  });

  it("rejects duplicated choice ids and duplicated correct-answer ids", () => {
    expect(
      questionSchema.safeParse({
        ...validMultipleResponse,
        choices: [
          { id: "a", text: "First.", explanation: "Một." },
          { id: "a", text: "Second.", explanation: "Hai." },
          { id: "b", text: "Third.", explanation: "Ba." },
        ],
      }).success,
    ).toBe(false);

    expect(
      questionSchema.safeParse({
        ...validMultipleResponse,
        correctChoiceIds: ["a", "a"],
      }).success,
    ).toBe(false);
  });

  it("rejects empty choice ids and correct-answer ids that point nowhere", () => {
    expect(
      questionSchema.safeParse({
        ...validMultipleResponse,
        choices: [
          { id: "", text: "Missing id.", explanation: "Thiếu id." },
          { id: "b", text: "Second.", explanation: "Hai." },
          { id: "c", text: "Third.", explanation: "Ba." },
        ],
      }).success,
    ).toBe(false);

    expect(
      questionSchema.safeParse({
        ...validMultipleResponse,
        correctChoiceIds: ["a", "not-a-choice"],
      }).success,
    ).toBe(false);
  });
});

describe("source and verification metadata", () => {
  it("requires at least one source for a verified claim", () => {
    expect(
      verificationSchema.safeParse({
        status: "verified",
        checkedAt: "2026-10-26",
        note: "Checked against the guide.",
        sourceIds: [],
      }).success,
    ).toBe(false);

    expect(
      verificationSchema.safeParse({
        status: "unverified",
        checkedAt: "2026-10-26",
        note: "Still waiting for the guide.",
        sourceIds: [],
      }).success,
    ).toBe(true);
  });

  it("requires lesson sources and a verification record", () => {
    expect(lessonSchema.safeParse({ ...lesson, sourceIds: [] }).success).toBe(false);

    const withoutVerification = { ...lesson } as Record<string, unknown>;
    delete withoutVerification.verification;
    expect(lessonSchema.safeParse(withoutVerification).success).toBe(false);

    expect(
      lessonSchema.safeParse({
        ...lesson,
        verification: { ...lesson.verification, sourceIds: [] },
      }).success,
    ).toBe(false);
  });

  it("only allows HTTPS source URLs", () => {
    expect(sourceSchema.safeParse({ ...source, url: "http://example.com" }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...source, url: "https://example.com" }).success).toBe(true);
  });

  it("rejects sources without a supported claim", () => {
    expect(sourceSchema.safeParse({ ...source, supports: [] }).success).toBe(false);
  });
});

describe("content status consistency", () => {
  it("rejects published content that is not verified", () => {
    expect(
      lessonSchema.safeParse({
        ...lesson,
        contentStatus: "published",
        verification: { ...lesson.verification, status: "partially-verified" },
      }).success,
    ).toBe(false);

    expect(
      certificationSchema.safeParse({
        ...primaryCertification,
        contentStatus: "published",
        verification: { ...primaryCertification.verification, status: "unverified" },
      }).success,
    ).toBe(false);
  });

  it("rejects reviewed content with no verification at all", () => {
    expect(
      lessonSchema.safeParse({
        ...lesson,
        contentStatus: "reviewed",
        verification: { ...lesson.verification, status: "unverified", sourceIds: [] },
      }).success,
    ).toBe(false);
  });

  it("allows draft content to remain unverified", () => {
    expect(
      lessonSchema.safeParse({
        ...lesson,
        contentStatus: "draft",
        verification: { ...lesson.verification, status: "unverified", sourceIds: [] },
      }).success,
    ).toBe(true);
  });
});

describe("content-pack cross-references", () => {
  it("rejects duplicate source ids", () => {
    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        sources: [...contentPack.sources, contentPack.sources[0]],
      }).success,
    ).toBe(false);

    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        lessons: [{ ...lesson, sourceIds: ["missing-source"] }],
      }).success,
    ).toBe(false);
  });

  it("rejects an exam mapping that points at an unknown objective", () => {
    expect(
      lessonSchema.safeParse({
        ...lesson,
        examMapping: {
          status: "unmapped",
          objectiveIds: ["not-allowed-when-unmapped"],
          note: "Unmapped lessons cannot claim objectives.",
        },
      }).success,
    ).toBe(false);

    expect(
      lessonSchema.safeParse({
        ...lesson,
        examMapping: {
          status: "candidate",
          objectiveIds: ["objective-that-does-not-exist"],
          note: "Candidate mapping.",
        },
      }).success,
    ).toBe(true);

    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        lessons: [
          {
            ...lesson,
            examMapping: {
              status: "candidate",
              objectiveIds: ["objective-that-does-not-exist"],
              note: "Candidate mapping.",
            },
          },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects a verified certification backed only by product documentation", () => {
    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        certifications: [
          {
            ...primaryCertification,
            verification: {
              ...primaryCertification.verification,
              sourceIds: ["anthropic-context-windows-doc"],
            },
          },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects assessments with duplicate ids or unknown question references", () => {
    const assessment = contentPack.assessments[0]!;

    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        assessments: [assessment, assessment],
      }).success,
    ).toBe(false);

    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        assessments: [{ ...assessment, questionIds: ["missing-question"] }],
      }).success,
    ).toBe(false);

    expect(
      contentPackSchema.safeParse({
        ...contentPack,
        assessments: [{ ...assessment, questionIds: [] }],
      }).success,
    ).toBe(false);
  });

  it("rejects domain weights that do not total 100", () => {
    expect(
      blueprintSchema.safeParse({
        ...primaryBlueprint,
        domains: primaryBlueprint.domains.map((domain, index) =>
          index === 0 ? { ...domain, weightPercent: 20 } : domain,
        ),
      }).success,
    ).toBe(false);
  });

  it("rejects a verified published blueprint with no exam format", () => {
    expect(
      blueprintSchema.safeParse({
        ...primaryBlueprint,
        format: {},
      }).success,
    ).toBe(false);
  });
});
