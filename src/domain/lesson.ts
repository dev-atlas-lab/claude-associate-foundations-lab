import { z } from "zod";
import {
  contentStatusProblem,
  contentStatusSchema,
  identifierSchema,
  verificationSchema,
} from "./common";

export const lessonSectionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("paragraphs"),
    heading: z.string().trim().min(1),
    paragraphs: z.array(z.string().trim().min(1)).min(1),
  }),
  z.object({
    kind: z.literal("list"),
    heading: z.string().trim().min(1),
    items: z.array(z.string().trim().min(1)).min(2),
  }),
  z.object({
    kind: z.literal("callout"),
    tone: z.enum(["note", "caution"]),
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
  }),
  z.object({
    kind: z.literal("diagram"),
    heading: z.string().trim().min(1),
    diagramId: identifierSchema,
    intro: z.string().trim().min(1),
  }),
]);

export type LessonSection = z.infer<typeof lessonSectionSchema>;

export const answerChoiceSchema = z.object({
  id: identifierSchema,
  /** English, like the exam. */
  text: z.string().trim().min(1),
  /** Vietnamese explanation of why this option is right or wrong. */
  explanation: z.string().trim().min(1),
});

export type AnswerChoice = z.infer<typeof answerChoiceSchema>;

export const questionTypeSchema = z.enum(["single-choice", "multiple-response"]);
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const questionSchema = z
  .object({
    id: identifierSchema,
    type: questionTypeSchema,
    /** English question stem, matching the certification exam language. */
    stem: z.string().trim().min(1),
    choices: z.array(answerChoiceSchema).min(2).max(8),
    correctChoiceIds: z.array(identifierSchema).min(1),
    /** Vietnamese rationale for the correct answer as a whole. */
    correctExplanation: z.string().trim().min(1),
    sourceIds: z.array(identifierSchema).min(1),
  })
  .superRefine((question, ctx) => {
    const choiceIds = new Set<string>();

    question.choices.forEach((choice, index) => {
      if (choiceIds.has(choice.id)) {
        ctx.addIssue({
          code: "custom",
          message: `duplicate choice id "${choice.id}"`,
          path: ["choices", index, "id"],
        });
      }
      choiceIds.add(choice.id);
    });

    const correctIds = new Set(question.correctChoiceIds);

    if (correctIds.size !== question.correctChoiceIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "correctChoiceIds must not contain duplicates",
        path: ["correctChoiceIds"],
      });
    }

    for (const correctId of question.correctChoiceIds) {
      if (!choiceIds.has(correctId)) {
        ctx.addIssue({
          code: "custom",
          message: `correctChoiceId "${correctId}" does not match any choice`,
          path: ["correctChoiceIds"],
        });
      }
    }

    if (question.type === "single-choice" && question.correctChoiceIds.length !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "single-choice questions must have exactly one correct choice",
        path: ["correctChoiceIds"],
      });
    }

    if (question.type === "multiple-response") {
      if (question.correctChoiceIds.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "multiple-response questions must have at least two correct choices",
          path: ["correctChoiceIds"],
        });
      }

      if (question.correctChoiceIds.length >= question.choices.length) {
        ctx.addIssue({
          code: "custom",
          message: "multiple-response questions must leave at least one distractor",
          path: ["correctChoiceIds"],
        });
      }
    }
  });

export type Question = z.infer<typeof questionSchema>;

export const examMappingStatusSchema = z.enum(["unmapped", "candidate", "verified"]);
export type ExamMappingStatus = z.infer<typeof examMappingStatusSchema>;

export const examMappingSchema = z
  .object({
    status: examMappingStatusSchema,
    objectiveIds: z.array(identifierSchema),
    note: z.string().trim().min(1),
  })
  .superRefine((mapping, ctx) => {
    if (mapping.status === "unmapped" && mapping.objectiveIds.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: "unmapped lessons cannot claim exam objectives",
        path: ["objectiveIds"],
      });
    }

    if (mapping.status !== "unmapped" && mapping.objectiveIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "candidate and verified mappings need at least one objective",
        path: ["objectiveIds"],
      });
    }
  });

export type ExamMapping = z.infer<typeof examMappingSchema>;

export const lessonKindSchema = z.enum(["sample", "curriculum"]);
export type LessonKind = z.infer<typeof lessonKindSchema>;

export const keyTermSchema = z.object({
  en: z.string().trim().min(1),
  vi: z.string().trim().min(1),
  note: z.string().trim().min(1),
});

export const scenarioSchema = z.object({
  title: z.string().trim().min(1),
  setup: z.string().trim().min(1),
  steps: z.array(z.string().trim().min(1)).min(1),
  takeaway: z.string().trim().min(1),
});

export const lessonSchema = z
  .object({
    id: identifierSchema,
    certificationId: identifierSchema,
    blueprintId: identifierSchema,
    order: z.number().int().positive(),
    kind: lessonKindSchema,
    contentStatus: contentStatusSchema,
    title: z.string().trim().min(1),
    englishTitle: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    level: z.enum(["foundation", "intermediate", "advanced"]),
    estimatedMinutes: z.number().int().positive(),
    verification: verificationSchema,
    examMapping: examMappingSchema,
    objectives: z.array(z.string().trim().min(1)).min(2),
    sections: z.array(lessonSectionSchema).min(1),
    keyTerms: z.array(keyTermSchema).min(1),
    scenario: scenarioSchema,
    questions: z.array(questionSchema).min(1),
    takeaways: z.array(z.string().trim().min(1)).min(1),
    sourceIds: z.array(identifierSchema).min(1),
  })
  .superRefine((lesson, ctx) => {
    const statusProblem = contentStatusProblem(lesson.contentStatus, lesson.verification);

    if (statusProblem) {
      ctx.addIssue({ code: "custom", message: statusProblem, path: ["contentStatus"] });
    }

    if (lesson.examMapping.status === "verified" && lesson.verification.status !== "verified") {
      ctx.addIssue({
        code: "custom",
        message: "a verified exam mapping requires verified lesson content",
        path: ["examMapping", "status"],
      });
    }

    const questionIds = new Set<string>();

    lesson.questions.forEach((question, index) => {
      if (questionIds.has(question.id)) {
        ctx.addIssue({
          code: "custom",
          message: `duplicate question id "${question.id}" inside the lesson`,
          path: ["questions", index, "id"],
        });
      }
      questionIds.add(question.id);
    });

    if (lesson.sourceIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "lessons must cite at least one source",
        path: ["sourceIds"],
      });
    }
  });

export type Lesson = z.infer<typeof lessonSchema>;

/**
 * Glossary entries are general study notes, not exam claims. They therefore do
 * not carry per-entry source or verification metadata; the UI labels them
 * explicitly instead of implying official exam wording.
 */
export const glossaryEntrySchema = z.object({
  id: identifierSchema,
  term: z.string().trim().min(1),
  expansion: z.string().trim().min(1).optional(),
  vi: z.string().trim().min(1),
  definition: z.string().trim().min(1),
  category: z.string().trim().min(1),
});

export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;

export const plannedLessonSchema = z.object({
  id: identifierSchema,
  certificationId: identifierSchema,
  title: z.string().trim().min(1),
  note: z.string().trim().min(1),
  /** Optional until the lesson has a reviewed objective mapping. */
  domainId: identifierSchema.optional(),
});

export type PlannedLesson = z.infer<typeof plannedLessonSchema>;
