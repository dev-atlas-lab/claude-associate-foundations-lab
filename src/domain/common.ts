import { z } from "zod";

/**
 * Platform-core primitives. Nothing in this module knows about a specific
 * certification, provider, subject, or renderer.
 */

export const identifierSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "must be lowercase kebab-case (letters, digits, single hyphens)",
  );

export const uppercaseCodeSchema = z
  .string()
  .regex(
    /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/,
    "must be an uppercase identifier such as CCAO-F",
  );

/** A calendar date without inventing a time zone or time of day. */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must use YYYY-MM-DD")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "must be a real calendar date");

export const verificationStatusSchema = z.enum([
  "verified",
  "partially-verified",
  "unverified",
  "inferred",
]);
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

export const contentStatusSchema = z.enum(["draft", "reviewed", "published"]);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

export const verificationSchema = z
  .object({
    status: verificationStatusSchema,
    checkedAt: isoDateSchema,
    note: z.string().trim().min(1),
    sourceIds: z.array(identifierSchema),
  })
  .superRefine((verification, ctx) => {
    const uniqueIds = new Set(verification.sourceIds);

    if (uniqueIds.size !== verification.sourceIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "sourceIds must not contain duplicates",
        path: ["sourceIds"],
      });
    }

    if (
      (verification.status === "verified" || verification.status === "partially-verified") &&
      verification.sourceIds.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "verified and partially-verified claims require at least one source",
        path: ["sourceIds"],
      });
    }
  });

export type Verification = z.infer<typeof verificationSchema>;

export const sourceKindSchema = z.enum([
  "official-exam-guide",
  "official-certification-page",
  "official-faq",
  "official-prep-course",
  "official-provider-documentation",
  "official-engineering-blog",
  "third-party",
]);
export type SourceKind = z.infer<typeof sourceKindSchema>;

export const sourceSchema = z.object({
  id: identifierSchema,
  title: z.string().trim().min(1),
  publisher: z.string().trim().min(1),
  url: z
    .url()
    .refine((value) => value.startsWith("https://"), "source URLs must use HTTPS"),
  kind: sourceKindSchema,
  accessedAt: isoDateSchema,
  supports: z.array(z.string().trim().min(1)).min(1),
  /** Use when a source is official but was unavailable or only partly readable. */
  accessNote: z.string().trim().min(1).optional(),
});

export type Source = z.infer<typeof sourceSchema>;

/**
 * Published content may not rest on unverified claims. "reviewed" allows
 * partly-verified material because a reviewer has looked at it, but not
 * material with no supporting evidence at all.
 */
export function contentStatusProblem(
  contentStatus: ContentStatus,
  verification: Verification,
): string | undefined {
  if (contentStatus === "published" && verification.status !== "verified") {
    return "published content requires verification.status to be verified";
  }

  if (contentStatus === "reviewed" && verification.status === "unverified") {
    return "reviewed content may not be wholly unverified";
  }

  return undefined;
}
