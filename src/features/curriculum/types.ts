import { z } from "zod";

export const lessonSectionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("paragraphs"),
    heading: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    kind: z.literal("list"),
    heading: z.string().min(1),
    items: z.array(z.string().min(1)).min(2),
  }),
  z.object({
    kind: z.literal("callout"),
    tone: z.enum(["note", "caution"]),
    title: z.string().min(1),
    body: z.string().min(1),
  }),
  z.object({
    kind: z.literal("diagram"),
    heading: z.string().min(1),
    diagramId: z.literal("context-budget"),
    intro: z.string().min(1),
  }),
]);

export const knowledgeCheckSchema = z
  .object({
    question: z.string().min(1),
    options: z
      .array(
        z.object({
          id: z.string().min(1),
          text: z.string().min(1),
          explanation: z.string().min(1),
        }),
      )
      .min(2),
    correctOptionId: z.string().min(1),
    correctExplanation: z.string().min(1),
  })
  .superRefine((check, ctx) => {
    if (!check.options.some((option) => option.id === check.correctOptionId)) {
      ctx.addIssue({
        code: "custom",
        message: `correctOptionId "${check.correctOptionId}" does not match any option`,
      });
    }
  });

export const lessonSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lesson ids must be kebab-case"),
  order: z.number().int().positive(),
  status: z.enum(["published", "planned"]),
  title: z.string().min(1),
  englishTitle: z.string().min(1),
  summary: z.string().min(1),
  level: z.enum(["foundation", "intermediate"]),
  estimatedMinutes: z.number().int().positive(),
  verificationNote: z.string().min(1),
  objectives: z.array(z.string().min(1)).min(2),
  sections: z.array(lessonSectionSchema).min(1),
  keyTerms: z
    .array(
      z.object({
        en: z.string().min(1),
        vi: z.string().min(1),
        note: z.string().min(1),
      }),
    )
    .min(1),
  scenario: z.object({
    title: z.string().min(1),
    setup: z.string().min(1),
    steps: z.array(z.string().min(1)).min(1),
    takeaway: z.string().min(1),
  }),
  knowledgeCheck: knowledgeCheckSchema,
  takeaways: z.array(z.string().min(1)).min(1),
  sources: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.url(),
      }),
    )
    .min(1),
});

export type Lesson = z.infer<typeof lessonSchema>;
export type LessonSection = z.infer<typeof lessonSectionSchema>;
export type KnowledgeCheck = z.infer<typeof knowledgeCheckSchema>;

export type PlannedLesson = {
  id: string;
  title: string;
  note: string;
};
