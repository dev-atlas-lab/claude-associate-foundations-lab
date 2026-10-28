import { z } from "zod";
import {
  assessmentDefinitionSchema,
  assessmentPolicySchema,
  assessmentResultSchema,
  assessmentSessionSchema,
  AssessmentStateError,
  chooseAnswer,
  createAssessmentContext,
  goToQuestion,
  submitAssessment,
  toggleAnswerChoice,
  toggleQuestionFlag,
  type AssessmentContext,
  type AssessmentDefinition,
  type AssessmentPolicy,
  type AssessmentResult,
  type AssessmentSession,
} from "./assessment";
import { identifierSchema } from "./common";
import type { Question } from "./lesson";

/**
 * A timed mock-exam attempt.
 *
 * This module composes the existing assessment core instead of re-implementing
 * answers, navigation, flags, or exact-set scoring. What it adds is a persisted
 * deadline, an immutable question snapshot, and a one-time submission whose
 * final result is retained.
 *
 * Time is always derived from `deadlineAt` and an injected wall-clock timestamp.
 * There is no decrementing counter that could be extended by background-tab
 * timer throttling, and no server clock is available in a frontend-only app.
 */

export const TIMED_EXAM_SESSION_VERSION = 1;

const isoTimestampSchema = z.iso.datetime();
const sessionIdSchema = z.string().trim().min(1);

export const timedExamSubmissionReasonSchema = z.enum(["user", "time-expired"]);
export type TimedExamSubmissionReason = z.infer<typeof timedExamSubmissionReasonSchema>;

export const timedExamSessionSchema = z
  .object({
    schemaVersion: z.literal(TIMED_EXAM_SESSION_VERSION),
    id: sessionIdSchema,
    assessmentId: identifierSchema,
    blueprintId: identifierSchema,
    /** Immutable attempt order, snapshotted when the attempt starts. */
    questionIds: z.array(identifierSchema).min(1),
    policy: assessmentPolicySchema,
    durationMinutes: z.number().int().positive(),
    deadlineAt: isoTimestampSchema,
    session: assessmentSessionSchema,
    submissionReason: timedExamSubmissionReasonSchema.optional(),
    /** Written once at submission and never recalculated. */
    finalResult: assessmentResultSchema.optional(),
  })
  .superRefine((attempt, ctx) => {
    const { session, questionIds } = attempt;

    if (session.id !== attempt.id) {
      ctx.addIssue({
        code: "custom",
        message: "the embedded assessment session id must match the timed-exam id",
        path: ["session", "id"],
      });
    }

    if (session.assessmentId !== attempt.assessmentId) {
      ctx.addIssue({
        code: "custom",
        message: "the embedded assessment id must match the timed-exam assessment id",
        path: ["session", "assessmentId"],
      });
    }

    if (new Set(questionIds).size !== questionIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "timed-exam questionIds must not contain duplicates",
        path: ["questionIds"],
      });
    }

    if (session.currentQuestionIndex >= questionIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "currentQuestionIndex is outside the timed-exam question list",
        path: ["session", "currentQuestionIndex"],
      });
    }

    for (const questionId of Object.keys(session.answers)) {
      if (!questionIds.includes(questionId)) {
        ctx.addIssue({
          code: "custom",
          message: `answer references question "${questionId}" outside this timed exam`,
          path: ["session", "answers", questionId],
        });
      }
    }

    for (const questionId of session.flaggedQuestionIds) {
      if (!questionIds.includes(questionId)) {
        ctx.addIssue({
          code: "custom",
          message: `flag references question "${questionId}" outside this timed exam`,
          path: ["session", "flaggedQuestionIds"],
        });
      }
    }

    const startedAtMs = Date.parse(session.startedAt);
    const deadlineAtMs = Date.parse(attempt.deadlineAt);

    if (Number.isFinite(startedAtMs) && Number.isFinite(deadlineAtMs)) {
      const expectedDeadline = startedAtMs + attempt.durationMinutes * 60_000;

      if (deadlineAtMs !== expectedDeadline) {
        ctx.addIssue({
          code: "custom",
          message: "deadlineAt must equal startedAt plus the exam duration",
          path: ["deadlineAt"],
        });
      }

      if (deadlineAtMs <= startedAtMs) {
        ctx.addIssue({
          code: "custom",
          message: "deadlineAt must be after startedAt",
          path: ["deadlineAt"],
        });
      }
    }

    if (session.status === "submitted") {
      if (attempt.submissionReason === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "submitted timed exams need a submission reason",
          path: ["submissionReason"],
        });
      }

      if (attempt.finalResult === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "submitted timed exams need a retained final result",
          path: ["finalResult"],
        });
        return;
      }

      const result = attempt.finalResult;

      if (result.sessionId !== attempt.id) {
        ctx.addIssue({
          code: "custom",
          message: "the retained result belongs to a different session",
          path: ["finalResult", "sessionId"],
        });
      }

      if (result.assessmentId !== attempt.assessmentId) {
        ctx.addIssue({
          code: "custom",
          message: "the retained result belongs to a different assessment",
          path: ["finalResult", "assessmentId"],
        });
      }

      if (result.submittedAt !== session.submittedAt) {
        ctx.addIssue({
          code: "custom",
          message: "the retained result timestamp must match the submitted session",
          path: ["finalResult", "submittedAt"],
        });
      }

      if (result.totalQuestions !== questionIds.length) {
        ctx.addIssue({
          code: "custom",
          message: "the retained result must cover every timed-exam question",
          path: ["finalResult", "totalQuestions"],
        });
      }

      result.questions.forEach((score, index) => {
        if (score.questionId !== questionIds[index]) {
          ctx.addIssue({
            code: "custom",
            message: "the retained result must keep the attempt question order",
            path: ["finalResult", "questions", index, "questionId"],
          });
        }

        if (score.isCorrect !== (score.outcome === "correct")) {
          ctx.addIssue({
            code: "custom",
            message: "the retained result has an inconsistent correctness flag",
            path: ["finalResult", "questions", index, "isCorrect"],
          });
        }
      });

      const correct = result.questions.filter((score) => score.outcome === "correct").length;
      const incorrect = result.questions.filter((score) => score.outcome === "incorrect").length;
      const unanswered = result.questions.filter((score) => score.outcome === "unanswered").length;
      const expectedPercentage =
        result.totalQuestions === 0
          ? 0
          : Math.round((correct / result.totalQuestions) * 10000) / 100;

      if (result.correctAnswers !== correct) {
        ctx.addIssue({
          code: "custom",
          message: "the retained result correct count does not match its questions",
          path: ["finalResult", "correctAnswers"],
        });
      }

      if (result.incorrectAnswers !== incorrect) {
        ctx.addIssue({
          code: "custom",
          message: "the retained result incorrect count does not match its questions",
          path: ["finalResult", "incorrectAnswers"],
        });
      }

      if (result.unansweredQuestions !== unanswered) {
        ctx.addIssue({
          code: "custom",
          message: "the retained result unanswered count does not match its questions",
          path: ["finalResult", "unansweredQuestions"],
        });
      }

      if (result.answeredQuestions !== result.totalQuestions - unanswered) {
        ctx.addIssue({
          code: "custom",
          message: "the retained result answered count is inconsistent",
          path: ["finalResult", "answeredQuestions"],
        });
      }

      if (result.rawPercentage !== expectedPercentage) {
        ctx.addIssue({
          code: "custom",
          message: "the retained result percentage is inconsistent",
          path: ["finalResult", "rawPercentage"],
        });
      }
    } else {
      if (attempt.submissionReason !== undefined) {
        ctx.addIssue({
          code: "custom",
          message: "in-progress timed exams cannot have a submission reason",
          path: ["submissionReason"],
        });
      }

      if (attempt.finalResult !== undefined) {
        ctx.addIssue({
          code: "custom",
          message: "in-progress timed exams cannot have a final result",
          path: ["finalResult"],
        });
      }
    }
  });

export type TimedExamSession = z.infer<typeof timedExamSessionSchema>;

export interface CreateTimedExamSessionOptions {
  sessionId: string;
  assessmentId: string;
  blueprintId: string;
  questionIds: readonly string[];
  policy: AssessmentPolicy;
  durationMinutes: number;
  startedAt: string;
}

export function createTimedExamSession(
  options: CreateTimedExamSessionOptions,
): TimedExamSession {
  const startedAtMs = Date.parse(options.startedAt);

  if (!Number.isFinite(startedAtMs)) {
    throw new RangeError("startedAt must be a valid ISO-8601 timestamp");
  }

  if (!Number.isInteger(options.durationMinutes) || options.durationMinutes < 1) {
    throw new RangeError("durationMinutes must be a positive integer");
  }

  if (new Set(options.questionIds).size !== options.questionIds.length) {
    throw new RangeError("questionIds must not contain duplicates");
  }

  const deadlineAt = new Date(
    startedAtMs + options.durationMinutes * 60_000,
  ).toISOString();

  return timedExamSessionSchema.parse({
    schemaVersion: TIMED_EXAM_SESSION_VERSION,
    id: options.sessionId,
    assessmentId: options.assessmentId,
    blueprintId: options.blueprintId,
    questionIds: [...options.questionIds],
    policy: options.policy,
    durationMinutes: options.durationMinutes,
    deadlineAt,
    session: {
      id: options.sessionId,
      assessmentId: options.assessmentId,
      status: "in-progress",
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestionIds: [],
      startedAt: options.startedAt,
    },
  });
}

/**
 * Rebuild the assessment definition from the persisted snapshot. The live
 * registry is never allowed to add, remove, or reorder questions in an attempt.
 */
export function buildTimedExamDefinition(session: TimedExamSession): AssessmentDefinition {
  return assessmentDefinitionSchema.parse({
    id: session.assessmentId,
    title: session.assessmentId,
    questionIds: session.questionIds,
    policy: session.policy,
  });
}

export function createTimedExamContext(
  session: TimedExamSession,
  questions: Iterable<Question>,
): AssessmentContext {
  return createAssessmentContext(buildTimedExamDefinition(session), questions);
}

export interface TimedExamContentIssue {
  code: "missing-question" | "unknown-choice" | "invalid-result" | "unknown-answer-question";
  message: string;
  questionId?: string;
}

/**
 * Validate a loaded attempt against the current content before it is resumed or
 * reviewed. The storage fingerprint already blocks most content changes; this
 * is the second, content-aware line of defence.
 */
export function validateTimedExamContent(
  session: TimedExamSession,
  questionById: ReadonlyMap<string, Question>,
): TimedExamContentIssue[] {
  const issues: TimedExamContentIssue[] = [];
  const knownQuestionIds = new Set(session.questionIds);

  for (const questionId of session.questionIds) {
    if (!questionById.has(questionId)) {
      issues.push({
        code: "missing-question",
        message: `question "${questionId}" is no longer in the content registry`,
        questionId,
      });
    }
  }

  for (const [questionId, selectedChoiceIds] of Object.entries(session.session.answers)) {
    const question = questionById.get(questionId);

    if (!knownQuestionIds.has(questionId) || !question) {
      issues.push({
        code: "unknown-answer-question",
        message: `an answer references question "${questionId}" outside this attempt`,
        questionId,
      });
      continue;
    }

    const choiceIds = new Set(question.choices.map((choice) => choice.id));

    for (const choiceId of selectedChoiceIds) {
      if (!choiceIds.has(choiceId)) {
        issues.push({
          code: "unknown-choice",
          message: `an answer references choice "${choiceId}" that no longer belongs to "${questionId}"`,
          questionId,
        });
      }
    }

    if (question.type === "single-choice" && selectedChoiceIds.length > 1) {
      issues.push({
        code: "unknown-choice",
        message: `question "${questionId}" stores more than one single-choice answer`,
        questionId,
      });
    }
  }

  if (session.finalResult !== undefined) {
    for (const score of session.finalResult.questions) {
      const question = questionById.get(score.questionId);
      const storedAnswer = session.session.answers[score.questionId] ?? [];

      if (!question) {
        continue;
      }

      if (
        score.selectedChoiceIds.length !== storedAnswer.length ||
        score.selectedChoiceIds.some((choiceId) => !storedAnswer.includes(choiceId))
      ) {
        issues.push({
          code: "invalid-result",
          message: `the retained result for "${score.questionId}" does not match the submitted answers`,
          questionId: score.questionId,
        });
      }

      if (
        score.correctChoiceIds.length !== question.correctChoiceIds.length ||
        score.correctChoiceIds.some((choiceId) => !question.correctChoiceIds.includes(choiceId))
      ) {
        issues.push({
          code: "invalid-result",
          message: `the retained result for "${score.questionId}" does not match the current answer key`,
          questionId: score.questionId,
        });
      }
    }
  }

  return issues;
}

export function timedExamRemainingMs(session: TimedExamSession, now: string | number): number {
  const nowMs = typeof now === "number" ? now : Date.parse(now);

  if (!Number.isFinite(nowMs)) {
    return 0;
  }

  return Math.max(0, Date.parse(session.deadlineAt) - nowMs);
}

/** Display helper: rounds up so the final second shows 1 rather than 0. */
export function timedExamRemainingSeconds(
  session: TimedExamSession,
  now: string | number,
): number {
  return Math.ceil(timedExamRemainingMs(session, now) / 1000);
}

export function isTimedExamExpired(
  session: TimedExamSession,
  now: string | number,
): boolean {
  return (
    session.session.status === "in-progress" &&
    timedExamRemainingMs(session, now) === 0
  );
}

export interface TimedExamMutation {
  session: TimedExamSession;
  /** True only when this action caused the expiry submission. */
  autoSubmitted: boolean;
}

function requireInProgress(session: TimedExamSession): void {
  if (session.session.status !== "in-progress") {
    throw new AssessmentStateError(
      "session-not-in-progress",
      `timed exam "${session.id}" is already submitted and cannot be changed`,
    );
  }
}

function withAssessmentSession(
  timedSession: TimedExamSession,
  assessmentSession: AssessmentSession,
): TimedExamSession {
  return timedExamSessionSchema.parse({
    ...timedSession,
    session: assessmentSession,
  });
}

/**
 * Expire an attempt at its deadline. The submission timestamp is the persisted
 * deadline, not the moment the tab noticed, so repeated expiry events produce
 * the same immutable result.
 */
export function expireTimedExam(
  context: AssessmentContext,
  session: TimedExamSession,
  now: string | number,
): TimedExamMutation {
  if (session.session.status === "submitted") {
    return { session, autoSubmitted: false };
  }

  if (timedExamRemainingMs(session, now) > 0) {
    return { session, autoSubmitted: false };
  }

  const outcome = submitAssessment(context, session.session, session.deadlineAt);

  return {
    session: timedExamSessionSchema.parse({
      ...session,
      session: outcome.session,
      submissionReason: "time-expired",
      finalResult: outcome.result,
    }),
    autoSubmitted: true,
  };
}

export interface TimedExamSubmission {
  session: TimedExamSession;
  /** False when the attempt was already submitted. */
  changed: boolean;
}

/**
 * Submit early, or classify the submission as `time-expired` if the deadline
 * has already passed. The deadline always wins over a late user click.
 */
export function submitTimedExam(
  context: AssessmentContext,
  session: TimedExamSession,
  submittedAt: string,
): TimedExamSubmission {
  if (session.session.status === "submitted") {
    return { session, changed: false };
  }

  if (timedExamRemainingMs(session, submittedAt) === 0) {
    const expired = expireTimedExam(context, session, submittedAt);
    return { session: expired.session, changed: expired.autoSubmitted };
  }

  const outcome = submitAssessment(context, session.session, submittedAt);

  return {
    session: timedExamSessionSchema.parse({
      ...session,
      session: outcome.session,
      submissionReason: "user",
      finalResult: outcome.result,
    }),
    changed: true,
  };
}

/**
 * Apply an answer change unless the deadline has passed. Expiry wins: the
 * change is discarded and the attempt is submitted instead of accepting an
 * answer after time.
 */
export function chooseTimedExamAnswer(
  context: AssessmentContext,
  session: TimedExamSession,
  questionId: string,
  choiceIds: readonly string[],
  now: string | number,
): TimedExamMutation {
  requireInProgress(session);

  if (timedExamRemainingMs(session, now) === 0) {
    return expireTimedExam(context, session, now);
  }

  return {
    session: withAssessmentSession(
      session,
      chooseAnswer(context, session.session, questionId, choiceIds),
    ),
    autoSubmitted: false,
  };
}

export function toggleTimedExamAnswerChoice(
  context: AssessmentContext,
  session: TimedExamSession,
  questionId: string,
  choiceId: string,
  now: string | number,
): TimedExamMutation {
  requireInProgress(session);

  if (timedExamRemainingMs(session, now) === 0) {
    return expireTimedExam(context, session, now);
  }

  return {
    session: withAssessmentSession(
      session,
      toggleAnswerChoice(context, session.session, questionId, choiceId),
    ),
    autoSubmitted: false,
  };
}

/**
 * Navigation is an in-progress operation. Review navigation after submission is
 * view-only state in the UI, so the submitted attempt object stays immutable.
 */
export function goToTimedExamQuestion(
  context: AssessmentContext,
  session: TimedExamSession,
  index: number,
  now: string | number,
): TimedExamMutation {
  requireInProgress(session);

  if (timedExamRemainingMs(session, now) === 0) {
    return expireTimedExam(context, session, now);
  }

  return {
    session: withAssessmentSession(
      session,
      goToQuestion(context, session.session, index),
    ),
    autoSubmitted: false,
  };
}

export function toggleTimedExamFlag(
  context: AssessmentContext,
  session: TimedExamSession,
  questionId: string,
  now: string | number,
): TimedExamMutation {
  requireInProgress(session);

  if (timedExamRemainingMs(session, now) === 0) {
    return expireTimedExam(context, session, now);
  }

  return {
    session: withAssessmentSession(
      session,
      toggleQuestionFlag(context, session.session, questionId),
    ),
    autoSubmitted: false,
  };
}

/** Read the retained result. Never re-score a submitted timed exam. */
export function getTimedExamResult(session: TimedExamSession): AssessmentResult {
  if (session.session.status !== "submitted" || session.finalResult === undefined) {
    throw new Error(`timed exam "${session.id}" has not been submitted`);
  }

  return session.finalResult;
}

export function countTimedExamAnswers(session: TimedExamSession): {
  answered: number;
  unanswered: number;
  flagged: number;
} {
  const answered = session.questionIds.filter(
    (questionId) => (session.session.answers[questionId]?.length ?? 0) > 0,
  ).length;

  return {
    answered,
    unanswered: session.questionIds.length - answered,
    flagged: session.session.flaggedQuestionIds.length,
  };
}
