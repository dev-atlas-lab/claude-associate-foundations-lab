import { z } from "zod";
import {
  assessmentDefinitionSchema,
  assessmentPolicySchema,
  assessmentSessionSchema,
  calculateAssessmentResult,
  createAssessmentContext,
  type AssessmentDefinition,
  type AssessmentResult,
  type AssessmentSession,
  type QuestionScore,
} from "./assessment";
import { identifierSchema } from "./common";
import type { Question } from "./lesson";

/**
 * Local study state. Nothing here knows about a browser, a storage key, or a
 * React component: the same rules are used by the persistence adapter, the
 * review queue, and the progress report.
 */

const isoTimestampSchema = z.iso.datetime();
const attemptIdSchema = z.string().trim().min(1);

export const attemptOriginSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("practice"),
    practiceSetId: identifierSchema,
  }),
  z.object({
    kind: z.literal("mock-exam"),
    blueprintId: identifierSchema,
  }),
]);

export type AttemptOrigin = z.infer<typeof attemptOriginSchema>;

/**
 * A study attempt snapshots the ordered question ids and the assessment policy
 * that were in force when the learner started. Scores are never stored; they
 * are recalculated from the submitted session and the current answer keys.
 */
export const studyAttemptSchema = z
  .object({
    session: assessmentSessionSchema,
    questionIds: z.array(identifierSchema).min(1),
    policy: assessmentPolicySchema,
    origin: attemptOriginSchema,
  })
  .superRefine((attempt, ctx) => {
    const { session, questionIds } = attempt;

    if (new Set(questionIds).size !== questionIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "attempt questionIds must not contain duplicates",
        path: ["questionIds"],
      });
    }

    if (session.currentQuestionIndex >= questionIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "currentQuestionIndex is outside the attempt question list",
        path: ["session", "currentQuestionIndex"],
      });
    }

    for (const questionId of Object.keys(session.answers)) {
      if (!questionIds.includes(questionId)) {
        ctx.addIssue({
          code: "custom",
          message: `answer references question "${questionId}" outside this attempt`,
          path: ["session", "answers", questionId],
        });
      }
    }

    for (const questionId of session.flaggedQuestionIds) {
      if (!questionIds.includes(questionId)) {
        ctx.addIssue({
          code: "custom",
          message: `flag references question "${questionId}" outside this attempt`,
          path: ["session", "flaggedQuestionIds"],
        });
      }
    }

    if (attempt.origin.kind === "practice" && attempt.origin.practiceSetId !== session.assessmentId) {
      ctx.addIssue({
        code: "custom",
        message: "practice attempt assessmentId must match its practiceSetId",
        path: ["origin", "practiceSetId"],
      });
    }
  });

export type StudyAttempt = z.infer<typeof studyAttemptSchema>;

export const reviewResolutionSchema = z.object({
  attemptId: attemptIdSchema,
  questionId: identifierSchema,
  resolvedAt: isoTimestampSchema,
});

export type ReviewResolution = z.infer<typeof reviewResolutionSchema>;

export const studyStateSchema = z
  .object({
    attempts: z.array(studyAttemptSchema),
    reviewResolutions: z.array(reviewResolutionSchema),
  })
  .superRefine((state, ctx) => {
    const attemptIds = new Set<string>();

    state.attempts.forEach((attempt, index) => {
      if (attemptIds.has(attempt.session.id)) {
        ctx.addIssue({
          code: "custom",
          message: `duplicate attempt id "${attempt.session.id}"`,
          path: ["attempts", index, "session", "id"],
        });
      }
      attemptIds.add(attempt.session.id);
    });

    const resolutionKeys = new Set<string>();

    state.reviewResolutions.forEach((resolution, index) => {
      const key = reviewKey(resolution.attemptId, resolution.questionId);

      if (resolutionKeys.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: `duplicate review resolution for "${key}"`,
          path: ["reviewResolutions", index],
        });
      }
      resolutionKeys.add(key);
    });
  });

export type StudyState = z.infer<typeof studyStateSchema>;

export const emptyStudyState: StudyState = {
  attempts: [],
  reviewResolutions: [],
};

export type StudyStateErrorCode =
  | "submitted-attempt-immutable"
  | "attempt-not-found"
  | "unknown-question"
  | "attempt-not-submitted"
  | "attempt-already-active";

export class StudyStateError extends Error {
  readonly code: StudyStateErrorCode;

  constructor(code: StudyStateErrorCode, message: string) {
    super(message);
    this.name = "StudyStateError";
    this.code = code;
  }
}

export function reviewKey(attemptId: string, questionId: string): string {
  return `${attemptId}:${questionId}`;
}

export function createStudyAttempt(
  definition: AssessmentDefinition,
  session: AssessmentSession,
  origin: AttemptOrigin,
): StudyAttempt {
  return studyAttemptSchema.parse({
    session,
    questionIds: definition.questionIds,
    policy: definition.policy,
    origin,
  });
}

export function findStudyAttempt(
  state: StudyState,
  attemptId: string,
): StudyAttempt | undefined {
  return state.attempts.find((attempt) => attempt.session.id === attemptId);
}

/** The most recent in-progress attempt for an assessment, if one exists. */
export function findActiveAttempt(
  state: StudyState,
  assessmentId: string,
): StudyAttempt | undefined {
  return [...state.attempts]
    .reverse()
    .find(
      (attempt) =>
        attempt.session.assessmentId === assessmentId && attempt.session.status === "in-progress",
    );
}

export function findLatestSubmittedAttempt(
  state: StudyState,
  assessmentId: string,
): StudyAttempt | undefined {
  return [...state.attempts]
    .reverse()
    .find(
      (attempt) =>
        attempt.session.assessmentId === assessmentId && attempt.session.status === "submitted",
    );
}

/**
 * Insert or replace an in-progress attempt. A submitted attempt is immutable:
 * repeating the exact same submitted attempt is a no-op, while changing its
 * answers, flags, or timestamps is rejected.
 */
export function upsertStudyAttempt(state: StudyState, attempt: StudyAttempt): StudyState {
  const existing = findStudyAttempt(state, attempt.session.id);

  if (!existing) {
    return studyStateSchema.parse({
      ...state,
      attempts: [...state.attempts, attempt],
    });
  }

  if (existing.session.status === "submitted") {
    if (JSON.stringify(existing) === JSON.stringify(attempt)) {
      return state;
    }

    throw new StudyStateError(
      "submitted-attempt-immutable",
      `attempt "${attempt.session.id}" is submitted and cannot be changed`,
    );
  }

  return studyStateSchema.parse({
    ...state,
    attempts: state.attempts.map((candidate) =>
      candidate.session.id === attempt.session.id ? attempt : candidate,
    ),
  });
}

export function resolveReviewItem(
  state: StudyState,
  attemptId: string,
  questionId: string,
  resolvedAt: string,
): StudyState {
  const attempt = findStudyAttempt(state, attemptId);

  if (!attempt) {
    throw new StudyStateError("attempt-not-found", `attempt "${attemptId}" does not exist`);
  }

  if (attempt.session.status !== "submitted") {
    throw new StudyStateError(
      "attempt-not-submitted",
      `attempt "${attemptId}" must be submitted before a review item can be resolved`,
    );
  }

  if (!attempt.questionIds.includes(questionId)) {
    throw new StudyStateError(
      "unknown-question",
      `question "${questionId}" is not part of attempt "${attemptId}"`,
    );
  }

  if (
    state.reviewResolutions.some(
      (resolution) =>
        resolution.attemptId === attemptId && resolution.questionId === questionId,
    )
  ) {
    return state;
  }

  return studyStateSchema.parse({
    ...state,
    reviewResolutions: [
      ...state.reviewResolutions,
      { attemptId, questionId, resolvedAt },
    ],
  });
}

/**
 * Rebuild the definition for a stored attempt. The attempt snapshot is used
 * instead of the live registry so an in-progress attempt cannot silently gain
 * or lose questions.
 */
export function buildAttemptDefinition(
  attempt: StudyAttempt,
  title: string,
  description?: string,
): AssessmentDefinition {
  return assessmentDefinitionSchema.parse({
    id: attempt.session.assessmentId,
    title,
    description,
    questionIds: attempt.questionIds,
    policy: attempt.policy,
  });
}

export function calculateAttemptResult(
  attempt: StudyAttempt,
  questionById: ReadonlyMap<string, Question>,
): AssessmentResult {
  const definition = buildAttemptDefinition(attempt, attempt.session.assessmentId);
  const context = createAssessmentContext(definition, questionById.values());

  return calculateAssessmentResult(context, attempt.session);
}

export type ReviewReason = "incorrect" | "unanswered" | "flagged";

export interface ReviewItem {
  key: string;
  attemptId: string;
  assessmentId: string;
  origin: AttemptOrigin;
  submittedAt: string;
  question: Question;
  score: QuestionScore;
  reasons: ReviewReason[];
}

/**
 * The review queue is derived, not stored. Every submitted attempt contributes
 * its incorrect and unanswered questions, plus any flagged question even when
 * the answer was correct. Opening an item never resolves it; only an explicit
 * resolution removes it from the queue.
 */
export function deriveReviewItems(
  state: StudyState,
  questionById: ReadonlyMap<string, Question>,
): ReviewItem[] {
  const resolved = new Set(
    state.reviewResolutions.map((resolution) =>
      reviewKey(resolution.attemptId, resolution.questionId),
    ),
  );
  const items: ReviewItem[] = [];

  for (const attempt of state.attempts) {
    if (attempt.session.status !== "submitted" || attempt.session.submittedAt === undefined) {
      continue;
    }

    const result = calculateAttemptResult(attempt, questionById);

    for (const score of result.questions) {
      const reasons: ReviewReason[] = [];

      if (score.outcome === "incorrect") {
        reasons.push("incorrect");
      }

      if (score.outcome === "unanswered") {
        reasons.push("unanswered");
      }

      if (attempt.session.flaggedQuestionIds.includes(score.questionId)) {
        reasons.push("flagged");
      }

      if (reasons.length === 0) {
        continue;
      }

      const key = reviewKey(attempt.session.id, score.questionId);

      if (resolved.has(key)) {
        continue;
      }

      const question = questionById.get(score.questionId);

      if (!question) {
        continue;
      }

      items.push({
        key,
        attemptId: attempt.session.id,
        assessmentId: attempt.session.assessmentId,
        origin: attempt.origin,
        submittedAt: attempt.session.submittedAt,
        question,
        score,
        reasons,
      });
    }
  }

  return items.sort(
    (left, right) =>
      right.submittedAt.localeCompare(left.submittedAt) ||
      left.question.id.localeCompare(right.question.id),
  );
}

export function countReviewResolutions(state: StudyState): number {
  return state.reviewResolutions.length;
}
