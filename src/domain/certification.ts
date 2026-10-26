import { z } from "zod";
import {
  contentStatusProblem,
  contentStatusSchema,
  identifierSchema,
  isoDateSchema,
  uppercaseCodeSchema,
  verificationSchema,
} from "./common";

export const providerSchema = z.object({
  id: identifierSchema,
  name: z.string().trim().min(1),
  website: z.url(),
});

export type Provider = z.infer<typeof providerSchema>;

export const certificationSchema = z
  .object({
    id: identifierSchema,
    providerId: identifierSchema,
    name: z.string().trim().min(1),
    code: uppercaseCodeSchema,
    audience: z.string().trim().min(1),
    officialUrl: z.url(),
    verification: verificationSchema,
    contentStatus: contentStatusSchema,
  })
  .superRefine((certification, ctx) => {
    const problem = contentStatusProblem(certification.contentStatus, certification.verification);

    if (problem) {
      ctx.addIssue({ code: "custom", message: problem, path: ["contentStatus"] });
    }
  });

export type Certification = z.infer<typeof certificationSchema>;

export const itemTypeSchema = z.enum(["multiple-choice", "multiple-response"]);
export type ItemType = z.infer<typeof itemTypeSchema>;

export const passingScoreSchema = z
  .object({
    scaledMin: z.number().int(),
    scaledMax: z.number().int(),
    cutScore: z.number().int(),
  })
  .refine(
    (score) => score.scaledMin < score.cutScore && score.cutScore <= score.scaledMax,
    "cutScore must sit inside scaledMin and scaledMax",
  );

export type PassingScore = z.infer<typeof passingScoreSchema>;

export const examFormatSchema = z
  .object({
    itemCount: z.number().int().positive().optional(),
    timeLimitMinutes: z.number().int().positive().optional(),
    seatTimeMinutes: z.number().int().positive().optional(),
    itemTypes: z.array(itemTypeSchema).min(1).optional(),
    delivery: z.string().trim().min(1).optional(),
    passingScore: passingScoreSchema.optional(),
    feeUsd: z.number().positive().optional(),
    validityMonths: z.number().int().positive().optional(),
    resultReporting: z.string().trim().min(1).optional(),
  })
  .superRefine((format, ctx) => {
    if (
      format.timeLimitMinutes !== undefined &&
      format.seatTimeMinutes !== undefined &&
      format.seatTimeMinutes < format.timeLimitMinutes
    ) {
      ctx.addIssue({
        code: "custom",
        message: "seatTimeMinutes cannot be shorter than the timed exam",
        path: ["seatTimeMinutes"],
      });
    }

    if (format.itemTypes) {
      const uniqueTypes = new Set(format.itemTypes);

      if (uniqueTypes.size !== format.itemTypes.length) {
        ctx.addIssue({
          code: "custom",
          message: "itemTypes must not contain duplicates",
          path: ["itemTypes"],
        });
      }
    }
  });

export type ExamFormat = z.infer<typeof examFormatSchema>;

export const learningObjectiveSchema = z.object({
  id: identifierSchema,
  statement: z.string().trim().min(1),
});

export type LearningObjective = z.infer<typeof learningObjectiveSchema>;

export const domainSchema = z.object({
  id: identifierSchema,
  code: z.string().trim().min(1),
  title: z.string().trim().min(1),
  weightPercent: z.number().positive().max(100).optional(),
  objectives: z.array(learningObjectiveSchema).min(1),
});

export type Domain = z.infer<typeof domainSchema>;

const verifiedFormatFields = [
  "itemCount",
  "timeLimitMinutes",
  "itemTypes",
  "passingScore",
  "validityMonths",
] as const;

export const blueprintSchema = z
  .object({
    id: identifierSchema,
    certificationId: identifierSchema,
    version: z.string().trim().min(1),
    effectiveFrom: isoDateSchema.optional(),
    effectiveFromLabel: z.string().trim().min(1),
    versionNotice: z.string().trim().min(1).optional(),
    versionNoticeSourceIds: z.array(identifierSchema).default([]),
    format: examFormatSchema,
    domains: z.array(domainSchema).min(1),
    verification: verificationSchema,
    contentStatus: contentStatusSchema,
  })
  .superRefine((blueprint, ctx) => {
    const statusProblem = contentStatusProblem(blueprint.contentStatus, blueprint.verification);

    if (statusProblem) {
      ctx.addIssue({ code: "custom", message: statusProblem, path: ["contentStatus"] });
    }

    const domainIds = new Set<string>();
    const objectiveIds = new Set<string>();

    blueprint.domains.forEach((domain, domainIndex) => {
      if (domainIds.has(domain.id)) {
        ctx.addIssue({
          code: "custom",
          message: `duplicate domain id "${domain.id}"`,
          path: ["domains", domainIndex, "id"],
        });
      }
      domainIds.add(domain.id);

      domain.objectives.forEach((objective, objectiveIndex) => {
        if (objectiveIds.has(objective.id)) {
          ctx.addIssue({
            code: "custom",
            message: `duplicate objective id "${objective.id}" across the blueprint`,
            path: ["domains", domainIndex, "objectives", objectiveIndex, "id"],
          });
        }
        objectiveIds.add(objective.id);
      });
    });

    const weightedDomains = blueprint.domains.filter(
      (domain) => domain.weightPercent !== undefined,
    );

    if (weightedDomains.length > 0 && weightedDomains.length !== blueprint.domains.length) {
      ctx.addIssue({
        code: "custom",
        message: "either every domain has a weight or none does",
        path: ["domains"],
      });
    }

    if (weightedDomains.length === blueprint.domains.length) {
      const total = weightedDomains.reduce(
        (sum, domain) => sum + (domain.weightPercent ?? 0),
        0,
      );

      if (Math.abs(total - 100) > 0.001) {
        ctx.addIssue({
          code: "custom",
          message: `domain weights must total 100 (received ${total})`,
          path: ["domains"],
        });
      }
    }

    if (blueprint.contentStatus === "published" && blueprint.verification.status === "verified") {
      for (const field of verifiedFormatFields) {
        if (blueprint.format[field] === undefined) {
          ctx.addIssue({
            code: "custom",
            message: `verified published blueprints must state ${field}`,
            path: ["format", field],
          });
        }
      }
    }
  });

export type Blueprint = z.infer<typeof blueprintSchema>;
