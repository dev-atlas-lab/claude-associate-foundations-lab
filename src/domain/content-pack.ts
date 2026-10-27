import { z } from "zod";
import {
  assessmentDefinitionSchema,
  validateAssessmentDefinition,
} from "./assessment";
import { blueprintSchema, certificationSchema, providerSchema } from "./certification";
import { glossaryEntrySchema, lessonSchema, plannedLessonSchema } from "./lesson";
import { questionBankEntrySchema } from "./question-bank";
import { identifierSchema, sourceSchema } from "./common";

type Path = Array<string | number>;

/**
 * A practice set is a named entry point over an assessment definition. Its
 * question ids must all resolve to reviewed bank entries, and the declared
 * domains must exactly match the domains those questions are mapped to.
 */
export const practiceSetSchema = z.object({
  assessmentId: identifierSchema,
  domainIds: z.array(identifierSchema).min(1),
});

export type PracticeSet = z.infer<typeof practiceSetSchema>;

function addDuplicateIssues(
  values: string[],
  path: Path,
  label: string,
  ctx: z.RefinementCtx,
): void {
  const seen = new Set<string>();

  values.forEach((value, index) => {
    if (seen.has(value)) {
      ctx.addIssue({
        code: "custom",
        message: `duplicate ${label} "${value}"`,
        path: [...path, index],
      });
    }
    seen.add(value);
  });
}

function addMissingSourceIssues(
  sourceIds: string[],
  knownSourceIds: Set<string>,
  path: Path,
  ctx: z.RefinementCtx,
): void {
  sourceIds.forEach((sourceId, index) => {
    if (!knownSourceIds.has(sourceId)) {
      ctx.addIssue({
        code: "custom",
        message: `unknown source id "${sourceId}"`,
        path: [...path, index],
      });
    }
  });
}

/**
 * Cross-reference validation that a single-object schema cannot perform.
 * Content is parsed through this schema at module load, so broken references
 * fail the build/test run rather than surfacing as dead links at runtime.
 */
export const contentPackSchema = z
  .object({
    providers: z.array(providerSchema).min(1),
    certifications: z.array(certificationSchema).min(1),
    blueprints: z.array(blueprintSchema).min(1),
    sources: z.array(sourceSchema).min(1),
    lessons: z.array(lessonSchema),
    questionBank: z.array(questionBankEntrySchema),
    plannedLessons: z.array(plannedLessonSchema),
    assessments: z.array(assessmentDefinitionSchema),
    practiceSets: z.array(practiceSetSchema),
    glossary: z.array(glossaryEntrySchema),
  })
  .superRefine((pack, ctx) => {
    addDuplicateIssues(
      pack.providers.map((provider) => provider.id),
      ["providers"],
      "provider id",
      ctx,
    );
    addDuplicateIssues(
      pack.certifications.map((certification) => certification.id),
      ["certifications"],
      "certification id",
      ctx,
    );
    addDuplicateIssues(
      pack.blueprints.map((blueprint) => blueprint.id),
      ["blueprints"],
      "blueprint id",
      ctx,
    );
    addDuplicateIssues(
      pack.sources.map((source) => source.id),
      ["sources"],
      "source id",
      ctx,
    );
    addDuplicateIssues(
      pack.lessons.map((lesson) => lesson.id),
      ["lessons"],
      "lesson id",
      ctx,
    );
    addDuplicateIssues(
      pack.plannedLessons.map((lesson) => lesson.id),
      ["plannedLessons"],
      "planned lesson id",
      ctx,
    );
    addDuplicateIssues(
      pack.assessments.map((assessment) => assessment.id),
      ["assessments"],
      "assessment id",
      ctx,
    );
    addDuplicateIssues(
      pack.glossary.map((entry) => entry.id),
      ["glossary"],
      "glossary entry id",
      ctx,
    );

    const providerIds = new Set(pack.providers.map((provider) => provider.id));
    const certificationIds = new Set(
      pack.certifications.map((certification) => certification.id),
    );
    const blueprintById = new Map(pack.blueprints.map((blueprint) => [blueprint.id, blueprint]));
    const knownSourceIds = new Set(pack.sources.map((source) => source.id));
    const sourceById = new Map(pack.sources.map((source) => [source.id, source]));
    const officialExamSourceKinds = new Set([
      "official-exam-guide",
      "official-certification-page",
      "official-faq",
    ]);

    const hasOfficialExamEvidence = (sourceIds: string[]): boolean =>
      sourceIds.some((sourceId) => {
        const source = sourceById.get(sourceId);
        return source !== undefined && officialExamSourceKinds.has(source.kind);
      });

    const lessonIds = new Set(pack.lessons.map((lesson) => lesson.id));
    for (const [index, planned] of pack.plannedLessons.entries()) {
      if (lessonIds.has(planned.id)) {
        ctx.addIssue({
          code: "custom",
          message: `planned lesson "${planned.id}" duplicates a published lesson id`,
          path: ["plannedLessons", index, "id"],
        });
      }
    }

    pack.certifications.forEach((certification, index) => {
      if (!providerIds.has(certification.providerId)) {
        ctx.addIssue({
          code: "custom",
          message: `unknown provider id "${certification.providerId}"`,
          path: ["certifications", index, "providerId"],
        });
      }
      addMissingSourceIssues(
        certification.verification.sourceIds,
        knownSourceIds,
        ["certifications", index, "verification", "sourceIds"],
        ctx,
      );

      if (
        certification.verification.status === "verified" &&
        !hasOfficialExamEvidence(certification.verification.sourceIds)
      ) {
        ctx.addIssue({
          code: "custom",
          message:
            "verified certification claims need at least one official exam, certification, or FAQ source",
          path: ["certifications", index, "verification", "sourceIds"],
        });
      }
    });

    const objectiveIdsByBlueprint = new Map<string, Set<string>>();

    pack.blueprints.forEach((blueprint, index) => {
      if (!certificationIds.has(blueprint.certificationId)) {
        ctx.addIssue({
          code: "custom",
          message: `unknown certification id "${blueprint.certificationId}"`,
          path: ["blueprints", index, "certificationId"],
        });
      }
      addMissingSourceIssues(
        blueprint.verification.sourceIds,
        knownSourceIds,
        ["blueprints", index, "verification", "sourceIds"],
        ctx,
      );
      addMissingSourceIssues(
        blueprint.versionNoticeSourceIds,
        knownSourceIds,
        ["blueprints", index, "versionNoticeSourceIds"],
        ctx,
      );

      if (
        blueprint.verification.status === "verified" &&
        !hasOfficialExamEvidence(blueprint.verification.sourceIds)
      ) {
        ctx.addIssue({
          code: "custom",
          message:
            "verified blueprint claims need at least one official exam, certification, or FAQ source",
          path: ["blueprints", index, "verification", "sourceIds"],
        });
      }

      objectiveIdsByBlueprint.set(
        blueprint.id,
        new Set(
          blueprint.domains.flatMap((domain) =>
            domain.objectives.map((objective) => objective.id),
          ),
        ),
      );
    });

    const questionIds = new Set<string>();
    const bankQuestionIds = new Set(
      pack.questionBank.map((entry) => entry.question.id),
    );

    pack.lessons.forEach((lesson, lessonIndex) => {
      const blueprint = blueprintById.get(lesson.blueprintId);

      if (!blueprint) {
        ctx.addIssue({
          code: "custom",
          message: `unknown blueprint id "${lesson.blueprintId}"`,
          path: ["lessons", lessonIndex, "blueprintId"],
        });
      } else if (blueprint.certificationId !== lesson.certificationId) {
        ctx.addIssue({
          code: "custom",
          message: `lesson certification "${lesson.certificationId}" does not match blueprint certification "${blueprint.certificationId}"`,
          path: ["lessons", lessonIndex, "certificationId"],
        });
      }

      if (
        lesson.examMapping.status === "verified" &&
        blueprint !== undefined &&
        blueprint.verification.status !== "verified"
      ) {
        ctx.addIssue({
          code: "custom",
          message: "a verified exam mapping requires a verified blueprint",
          path: ["lessons", lessonIndex, "examMapping", "status"],
        });
      }

      if (!certificationIds.has(lesson.certificationId)) {
        ctx.addIssue({
          code: "custom",
          message: `unknown certification id "${lesson.certificationId}"`,
          path: ["lessons", lessonIndex, "certificationId"],
        });
      }

      addMissingSourceIssues(
        lesson.verification.sourceIds,
        knownSourceIds,
        ["lessons", lessonIndex, "verification", "sourceIds"],
        ctx,
      );
      addMissingSourceIssues(
        lesson.sourceIds,
        knownSourceIds,
        ["lessons", lessonIndex, "sourceIds"],
        ctx,
      );

      lesson.relatedQuestionIds.forEach((questionId, questionIndex) => {
        if (!bankQuestionIds.has(questionId)) {
          ctx.addIssue({
            code: "custom",
            message: `related question "${questionId}" is not in the reviewed question bank`,
            path: ["lessons", lessonIndex, "relatedQuestionIds", questionIndex],
          });
        }
      });

      const objectiveIds = objectiveIdsByBlueprint.get(lesson.blueprintId);
      if (objectiveIds && lesson.examMapping.status !== "unmapped") {
        lesson.examMapping.objectiveIds.forEach((objectiveId, objectiveIndex) => {
          if (!objectiveIds.has(objectiveId)) {
            ctx.addIssue({
              code: "custom",
              message: `unknown objective id "${objectiveId}" for blueprint "${lesson.blueprintId}"`,
              path: ["lessons", lessonIndex, "examMapping", "objectiveIds", objectiveIndex],
            });
          }
        });
      }

      lesson.questions.forEach((question, questionIndex) => {
        if (questionIds.has(question.id)) {
          ctx.addIssue({
            code: "custom",
            message: `question id "${question.id}" is not unique across the content pack`,
            path: ["lessons", lessonIndex, "questions", questionIndex, "id"],
          });
        }
        questionIds.add(question.id);
        addMissingSourceIssues(
          question.sourceIds,
          knownSourceIds,
          ["lessons", lessonIndex, "questions", questionIndex, "sourceIds"],
          ctx,
        );
      });
    });

    pack.questionBank.forEach((entry, entryIndex) => {
      const blueprint = blueprintById.get(entry.blueprintId);

      if (!blueprint) {
        ctx.addIssue({
          code: "custom",
          message: `unknown blueprint id "${entry.blueprintId}"`,
          path: ["questionBank", entryIndex, "blueprintId"],
        });
      } else if (blueprint.certificationId !== entry.certificationId) {
        ctx.addIssue({
          code: "custom",
          message: `question-bank certification "${entry.certificationId}" does not match blueprint certification "${blueprint.certificationId}"`,
          path: ["questionBank", entryIndex, "certificationId"],
        });
      }

      if (!certificationIds.has(entry.certificationId)) {
        ctx.addIssue({
          code: "custom",
          message: `unknown certification id "${entry.certificationId}"`,
          path: ["questionBank", entryIndex, "certificationId"],
        });
      }

      addMissingSourceIssues(
        entry.verification.sourceIds,
        knownSourceIds,
        ["questionBank", entryIndex, "verification", "sourceIds"],
        ctx,
      );
      addMissingSourceIssues(
        entry.question.sourceIds,
        knownSourceIds,
        ["questionBank", entryIndex, "question", "sourceIds"],
        ctx,
      );

      if (
        entry.examMapping.status === "verified" &&
        blueprint !== undefined &&
        blueprint.verification.status !== "verified"
      ) {
        ctx.addIssue({
          code: "custom",
          message: "a verified exam mapping requires a verified blueprint",
          path: ["questionBank", entryIndex, "examMapping", "status"],
        });
      }

      const knownObjectiveIds = objectiveIdsByBlueprint.get(entry.blueprintId);
      if (knownObjectiveIds && entry.examMapping.status !== "unmapped") {
        entry.examMapping.objectiveIds.forEach((objectiveId, objectiveIndex) => {
          if (!knownObjectiveIds.has(objectiveId)) {
            ctx.addIssue({
              code: "custom",
              message: `unknown objective id "${objectiveId}" for blueprint "${entry.blueprintId}"`,
              path: [
                "questionBank",
                entryIndex,
                "examMapping",
                "objectiveIds",
                objectiveIndex,
              ],
            });
          }
        });
      }

      if (questionIds.has(entry.question.id)) {
        ctx.addIssue({
          code: "custom",
          message: `question id "${entry.question.id}" is not unique across the content pack`,
          path: ["questionBank", entryIndex, "question", "id"],
        });
      }
      questionIds.add(entry.question.id);
    });

    const questionById = new Map([
      ...pack.lessons.flatMap((lesson) =>
        lesson.questions.map((question) => [question.id, question] as const),
      ),
      ...pack.questionBank.map((entry) => [entry.question.id, entry.question] as const),
    ]);

    pack.assessments.forEach((assessment, index) => {
      const issues = validateAssessmentDefinition(assessment, questionById);

      for (const issue of issues) {
        ctx.addIssue({
          code: "custom",
          message: issue.message,
          path: ["assessments", index, "questionIds"],
        });
      }
    });

    const assessmentById = new Map(
      pack.assessments.map((assessment) => [assessment.id, assessment]),
    );
    const bankEntryByQuestionId = new Map(
      pack.questionBank.map((entry) => [entry.question.id, entry]),
    );
    const domainIdByObjectiveId = new Map<string, string>();
    const allDomainIds = new Set<string>();

    for (const blueprint of pack.blueprints) {
      for (const domain of blueprint.domains) {
        allDomainIds.add(domain.id);

        for (const objective of domain.objectives) {
          domainIdByObjectiveId.set(objective.id, domain.id);
        }
      }
    }

    addDuplicateIssues(
      pack.practiceSets.map((practiceSet) => practiceSet.assessmentId),
      ["practiceSets"],
      "practice set assessment id",
      ctx,
    );

    pack.practiceSets.forEach((practiceSet, index) => {
      const assessment = assessmentById.get(practiceSet.assessmentId);

      if (!assessment) {
        ctx.addIssue({
          code: "custom",
          message: `unknown assessment id "${practiceSet.assessmentId}"`,
          path: ["practiceSets", index, "assessmentId"],
        });
        return;
      }

      addDuplicateIssues(
        practiceSet.domainIds,
        ["practiceSets", index, "domainIds"],
        "practice set domain id",
        ctx,
      );

      const coveredDomainIds = new Set<string>();

      assessment.questionIds.forEach((questionId, questionIndex) => {
        const entry = bankEntryByQuestionId.get(questionId);

        if (!entry) {
          ctx.addIssue({
            code: "custom",
            message: `practice set question "${questionId}" is not a reviewed bank item`,
            path: ["practiceSets", index, "assessmentId", questionIndex],
          });
          return;
        }

        for (const objectiveId of entry.examMapping.objectiveIds) {
          const domainId = domainIdByObjectiveId.get(objectiveId);

          if (domainId) {
            coveredDomainIds.add(domainId);
          }
        }
      });

      for (const domainId of practiceSet.domainIds) {
        if (!allDomainIds.has(domainId)) {
          ctx.addIssue({
            code: "custom",
            message: `unknown domain id "${domainId}"`,
            path: ["practiceSets", index, "domainIds"],
          });
        } else if (!coveredDomainIds.has(domainId)) {
          ctx.addIssue({
            code: "custom",
            message: `practice set declares domain "${domainId}" but none of its questions map to it`,
            path: ["practiceSets", index, "domainIds"],
          });
        }
      }

      for (const domainId of coveredDomainIds) {
        if (!practiceSet.domainIds.includes(domainId)) {
          ctx.addIssue({
            code: "custom",
            message: `practice set question maps to undeclared domain "${domainId}"`,
            path: ["practiceSets", index, "domainIds"],
          });
        }
      }
    });

    pack.plannedLessons.forEach((planned, index) => {
      if (!certificationIds.has(planned.certificationId)) {
        ctx.addIssue({
          code: "custom",
          message: `unknown certification id "${planned.certificationId}"`,
          path: ["plannedLessons", index, "certificationId"],
        });
      }

      if (planned.domainId) {
        const domainExists = pack.blueprints.some(
          (blueprint) =>
            blueprint.certificationId === planned.certificationId &&
            blueprint.domains.some((domain) => domain.id === planned.domainId),
        );

        if (!domainExists) {
          ctx.addIssue({
            code: "custom",
            message: `unknown domain id "${planned.domainId}" for certification "${planned.certificationId}"`,
            path: ["plannedLessons", index, "domainId"],
          });
        }
      }
    });
  });

export type ContentPack = z.infer<typeof contentPackSchema>;
