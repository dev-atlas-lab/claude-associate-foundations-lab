import { z } from "zod";
import { identifierSchema } from "./common";
import { questionTypeSchema, type Question } from "./lesson";

/**
 * Reusable assessment primitives. Nothing in this module knows about a
 * certification, an exam code, a timer, a storage backend, or a UI framework.
 */

/**
 * Policies that affect assessment behaviour. Only exact-set scoring is
 * implemented: an official policy requiring partial credit would need an
 * explicit, separately reviewed scoring mode rather than a silent toggle.
 */
export const assessmentPolicySchema = z.object({
  scoring: z.literal("all-or-nothing"),
  allowAnswerChangesBeforeSubmit: z.boolean(),
});

export type AssessmentPolicy = z.infer<typeof assessmentPolicySchema>;

export const assessmentDefinitionSchema = z.object({
  id: identifierSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  /**
   * An empty list is allowed by this object schema so the cross-reference
   * validator can report it as "empty-assessment" instead of throwing an
   * opaque Zod error at parse time.
   */
  questionIds: z.array(identifierSchema),
  policy: assessmentPolicySchema,
});

export type AssessmentDefinition = z.infer<typeof assessmentDefinitionSchema>;

export const assessmentSessionStatusSchema = z.enum(["in-progress", "submitted"]);
export type AssessmentSessionStatus = z.infer<typeof assessmentSessionStatusSchema>;

const isoTimestampSchema = z.iso.datetime();

/**
 * Session state is intentionally small. Scores are never stored here: they
 * are derived from the submitted answers and the question answer keys.
 */
export const assessmentSessionSchema = z
  .object({
    id: z.string().trim().min(1),
    assessmentId: identifierSchema,
    status: assessmentSessionStatusSchema,
    currentQuestionIndex: z.number().int().nonnegative(),
    /** Question id to selected choice ids. Empty selections are omitted. */
    answers: z.record(identifierSchema, z.array(identifierSchema)),
    flaggedQuestionIds: z.array(identifierSchema),
    startedAt: isoTimestampSchema,
    submittedAt: isoTimestampSchema.optional(),
  })
  .superRefine((session, ctx) => {
    if (session.status === "submitted" && session.submittedAt === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "submitted sessions need a submittedAt timestamp",
        path: ["submittedAt"],
      });
    }

    if (session.status === "in-progress" && session.submittedAt !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "in-progress sessions cannot have a submittedAt timestamp",
        path: ["submittedAt"],
      });
    }

    if (new Set(session.flaggedQuestionIds).size !== session.flaggedQuestionIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "flaggedQuestionIds must not contain duplicates",
        path: ["flaggedQuestionIds"],
      });
    }
  });

export type AssessmentSession = z.infer<typeof assessmentSessionSchema>;

export type AssessmentValidationIssueCode =
  | "empty-assessment"
  | "duplicate-question-id"
  | "missing-question";

export interface AssessmentValidationIssue {
  code: AssessmentValidationIssueCode;
  message: string;
  questionId?: string;
}

export type AssessmentStateErrorCode =
  | "wrong-assessment"
  | "unknown-question"
  | "unknown-choice"
  | "invalid-selection"
  | "answer-changes-not-allowed"
  | "index-out-of-range"
  | "session-not-in-progress"
  | "session-not-submitted";

export class AssessmentDefinitionError extends Error {
  readonly issues: readonly AssessmentValidationIssue[];

  constructor(issues: readonly AssessmentValidationIssue[]) {
    super(`Invalid assessment definition: ${issues.map((issue) => issue.message).join("; ")}`);
    this.name = "AssessmentDefinitionError";
    this.issues = issues;
  }
}

export class AssessmentStateError extends Error {
  readonly code: AssessmentStateErrorCode;

  constructor(code: AssessmentStateErrorCode, message: string) {
    super(message);
    this.name = "AssessmentStateError";
    this.code = code;
  }
}

export interface AssessmentContext {
  readonly definition: AssessmentDefinition;
  readonly questionById: ReadonlyMap<string, Question>;
}

/**
 * Report every definition problem at once. Missing questions, duplicate
 * question references, and empty assessments are all explicit issues rather
 * than silent skips.
 */
export function validateAssessmentDefinition(
  definition: AssessmentDefinition,
  questionById: ReadonlyMap<string, Question>,
): AssessmentValidationIssue[] {
  const issues: AssessmentValidationIssue[] = [];

  if (definition.questionIds.length === 0) {
    issues.push({
      code: "empty-assessment",
      message: `assessment "${definition.id}" has no questions`,
    });
  }

  const seen = new Set<string>();

  for (const questionId of definition.questionIds) {
    if (seen.has(questionId)) {
      issues.push({
        code: "duplicate-question-id",
        message: `assessment "${definition.id}" references question "${questionId}" more than once`,
        questionId,
      });
    }
    seen.add(questionId);

    if (!questionById.has(questionId)) {
      issues.push({
        code: "missing-question",
        message: `assessment "${definition.id}" references unknown question "${questionId}"`,
        questionId,
      });
    }
  }

  return issues;
}

/**
 * Build a validated context. Content-level errors are programmer/content
 * errors, so starting a session fails loudly instead of producing a partial
 * assessment.
 */
export function createAssessmentContext(
  definition: AssessmentDefinition,
  questions: Iterable<Question>,
): AssessmentContext {
  const questionById = new Map<string, Question>();

  for (const question of questions) {
    questionById.set(question.id, question);
  }

  const issues = validateAssessmentDefinition(definition, questionById);

  if (issues.length > 0) {
    throw new AssessmentDefinitionError(issues);
  }

  return { definition, questionById };
}

export interface StartAssessmentOptions {
  sessionId: string;
  startedAt: string;
}

export function startAssessment(
  context: AssessmentContext,
  options: StartAssessmentOptions,
): AssessmentSession {
  return assessmentSessionSchema.parse({
    id: options.sessionId,
    assessmentId: context.definition.id,
    status: "in-progress",
    currentQuestionIndex: 0,
    answers: {},
    flaggedQuestionIds: [],
    startedAt: options.startedAt,
  });
}

function assertSameAssessment(context: AssessmentContext, session: AssessmentSession): void {
  if (session.assessmentId !== context.definition.id) {
    throw new AssessmentStateError(
      "wrong-assessment",
      `session "${session.id}" belongs to assessment "${session.assessmentId}", not "${context.definition.id}"`,
    );
  }
}

function requireInProgress(session: AssessmentSession): void {
  if (session.status !== "in-progress") {
    throw new AssessmentStateError(
      "session-not-in-progress",
      `session "${session.id}" is ${session.status}; answers and flags are locked`,
    );
  }
}

function requireQuestion(context: AssessmentContext, questionId: string): Question {
  const question = context.questionById.get(questionId);

  if (!question || !context.definition.questionIds.includes(questionId)) {
    throw new AssessmentStateError(
      "unknown-question",
      `question "${questionId}" is not part of assessment "${context.definition.id}"`,
    );
  }

  return question;
}

function hasSameChoiceIds(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const rightSet = new Set(right);
  return left.every((choiceId) => rightSet.has(choiceId));
}

function validateSelection(question: Question, choiceIds: readonly string[]): void {
  if (new Set(choiceIds).size !== choiceIds.length) {
    throw new AssessmentStateError(
      "invalid-selection",
      `question "${question.id}" received duplicate choice ids`,
    );
  }

  const knownChoiceIds = new Set(question.choices.map((choice) => choice.id));

  for (const choiceId of choiceIds) {
    if (!knownChoiceIds.has(choiceId)) {
      throw new AssessmentStateError(
        "unknown-choice",
        `choice "${choiceId}" does not belong to question "${question.id}"`,
      );
    }
  }

  if (question.type === "single-choice" && choiceIds.length > 1) {
    throw new AssessmentStateError(
      "invalid-selection",
      `single-choice question "${question.id}" accepts at most one choice`,
    );
  }
}

/**
 * Replace the selected set for one question. Passing an empty array clears
 * the answer, which makes the question count as unanswered on submission.
 */
export function chooseAnswer(
  context: AssessmentContext,
  session: AssessmentSession,
  questionId: string,
  choiceIds: readonly string[],
): AssessmentSession {
  assertSameAssessment(context, session);
  requireInProgress(session);
  const question = requireQuestion(context, questionId);
  validateSelection(question, choiceIds);

  const current = session.answers[questionId] ?? [];

  if (
    !context.definition.policy.allowAnswerChangesBeforeSubmit &&
    current.length > 0 &&
    !hasSameChoiceIds(current, choiceIds)
  ) {
    throw new AssessmentStateError(
      "answer-changes-not-allowed",
      `assessment "${context.definition.id}" does not allow changing an existing answer`,
    );
  }

  const answers = { ...session.answers };

  if (choiceIds.length === 0) {
    delete answers[questionId];
  } else {
    answers[questionId] = [...choiceIds];
  }

  return { ...session, answers };
}

/**
 * Convenience operation for checkbox UIs. Single-choice questions always
 * select the chosen option; multiple-response questions toggle it.
 */
export function toggleAnswerChoice(
  context: AssessmentContext,
  session: AssessmentSession,
  questionId: string,
  choiceId: string,
): AssessmentSession {
  assertSameAssessment(context, session);
  requireInProgress(session);
  const question = requireQuestion(context, questionId);
  validateSelection(question, [choiceId]);

  if (question.type === "single-choice") {
    return chooseAnswer(context, session, questionId, [choiceId]);
  }

  const current = session.answers[questionId] ?? [];
  const next = current.includes(choiceId)
    ? current.filter((id) => id !== choiceId)
    : [...current, choiceId];

  return chooseAnswer(context, session, questionId, next);
}

/** Navigate to a zero-based question index; out-of-range indexes are rejected. */
export function goToQuestion(
  context: AssessmentContext,
  session: AssessmentSession,
  index: number,
): AssessmentSession {
  assertSameAssessment(context, session);

  if (!Number.isInteger(index) || index < 0 || index >= context.definition.questionIds.length) {
    throw new AssessmentStateError(
      "index-out-of-range",
      `question index ${index} is outside assessment "${context.definition.id}"`,
    );
  }

  if (index === session.currentQuestionIndex) {
    return session;
  }

  return { ...session, currentQuestionIndex: index };
}

/** Safe for keyboard/button use: the last question has no next question. */
export function goToNextQuestion(
  context: AssessmentContext,
  session: AssessmentSession,
): AssessmentSession {
  const nextIndex = session.currentQuestionIndex + 1;

  if (nextIndex >= context.definition.questionIds.length) {
    return session;
  }

  return goToQuestion(context, session, nextIndex);
}

/** Safe for keyboard/button use: the first question has no previous question. */
export function goToPreviousQuestion(
  context: AssessmentContext,
  session: AssessmentSession,
): AssessmentSession {
  const previousIndex = session.currentQuestionIndex - 1;

  if (previousIndex < 0) {
    return session;
  }

  return goToQuestion(context, session, previousIndex);
}

export function setQuestionFlag(
  context: AssessmentContext,
  session: AssessmentSession,
  questionId: string,
  flagged: boolean,
): AssessmentSession {
  assertSameAssessment(context, session);
  requireInProgress(session);
  requireQuestion(context, questionId);

  const isFlagged = session.flaggedQuestionIds.includes(questionId);

  if (isFlagged === flagged) {
    return session;
  }

  return {
    ...session,
    flaggedQuestionIds: flagged
      ? [...session.flaggedQuestionIds, questionId]
      : session.flaggedQuestionIds.filter((id) => id !== questionId),
  };
}

export function toggleQuestionFlag(
  context: AssessmentContext,
  session: AssessmentSession,
  questionId: string,
): AssessmentSession {
  return setQuestionFlag(
    context,
    session,
    questionId,
    !session.flaggedQuestionIds.includes(questionId),
  );
}

/**
 * Exact-set scoring. Empty selections are unanswered, not correct. Duplicate
 * or unknown ids can never produce a match.
 */
export function isAnswerCorrect(
  question: Pick<Question, "correctChoiceIds">,
  selectedChoiceIds: readonly string[],
): boolean {
  if (selectedChoiceIds.length === 0) {
    return false;
  }

  const selected = new Set(selectedChoiceIds);
  const correct = new Set(question.correctChoiceIds);

  if (selected.size !== selectedChoiceIds.length || correct.size !== question.correctChoiceIds.length) {
    return false;
  }

  if (selected.size !== correct.size) {
    return false;
  }

  return [...selected].every((choiceId) => correct.has(choiceId));
}

export const questionOutcomeSchema = z.enum(["correct", "incorrect", "unanswered"]);
export type QuestionOutcome = z.infer<typeof questionOutcomeSchema>;

export const questionScoreSchema = z.object({
  questionId: identifierSchema,
  questionType: questionTypeSchema,
  selectedChoiceIds: z.array(identifierSchema),
  correctChoiceIds: z.array(identifierSchema),
  outcome: questionOutcomeSchema,
  isCorrect: z.boolean(),
});

export type QuestionScore = z.infer<typeof questionScoreSchema>;

/**
 * A derived result snapshot. Timed exams persist this value at submission so a
 * completed attempt cannot be re-scored against later state. Practice attempts
 * continue to derive it on demand instead of storing it.
 */
export const assessmentResultSchema = z.object({
  assessmentId: identifierSchema,
  sessionId: z.string().trim().min(1),
  submittedAt: isoTimestampSchema,
  totalQuestions: z.number().int().nonnegative(),
  answeredQuestions: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  incorrectAnswers: z.number().int().nonnegative(),
  unansweredQuestions: z.number().int().nonnegative(),
  /** Rounded to two decimals. A practice metric, never an official scaled score. */
  rawPercentage: z.number().min(0).max(100),
  questions: z.array(questionScoreSchema),
});

export type AssessmentResult = z.infer<typeof assessmentResultSchema>;

export function calculateAssessmentResult(
  context: AssessmentContext,
  session: AssessmentSession,
): AssessmentResult {
  assertSameAssessment(context, session);

  if (session.status !== "submitted" || session.submittedAt === undefined) {
    throw new AssessmentStateError(
      "session-not-submitted",
      `session "${session.id}" must be submitted before it can be scored`,
    );
  }

  const questions: QuestionScore[] = context.definition.questionIds.map((questionId) => {
    const question = requireQuestion(context, questionId);
    const selectedChoiceIds = [...(session.answers[questionId] ?? [])];
    const outcome: QuestionOutcome =
      selectedChoiceIds.length === 0
        ? "unanswered"
        : isAnswerCorrect(question, selectedChoiceIds)
          ? "correct"
          : "incorrect";

    return {
      questionId,
      questionType: question.type,
      selectedChoiceIds,
      correctChoiceIds: [...question.correctChoiceIds],
      outcome,
      isCorrect: outcome === "correct",
    };
  });

  const totalQuestions = questions.length;
  const unansweredQuestions = questions.filter((question) => question.outcome === "unanswered").length;
  const answeredQuestions = totalQuestions - unansweredQuestions;
  const correctAnswers = questions.filter((question) => question.outcome === "correct").length;
  const incorrectAnswers = questions.filter((question) => question.outcome === "incorrect").length;
  const rawPercentage =
    totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 10000) / 100;

  return {
    assessmentId: context.definition.id,
    sessionId: session.id,
    submittedAt: session.submittedAt,
    totalQuestions,
    answeredQuestions,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    rawPercentage,
    questions,
  };
}

export interface SubmissionOutcome {
  session: AssessmentSession;
  result: AssessmentResult;
}

/**
 * Submit once. Re-submitting an already submitted session returns the stored
 * session and a result derived from its original answers and timestamp.
 */
export function submitAssessment(
  context: AssessmentContext,
  session: AssessmentSession,
  submittedAt: string,
): SubmissionOutcome {
  assertSameAssessment(context, session);

  if (session.status === "submitted") {
    return { session, result: calculateAssessmentResult(context, session) };
  }

  const submittedSession = assessmentSessionSchema.parse({
    ...session,
    status: "submitted",
    submittedAt,
  });

  return {
    session: submittedSession,
    result: calculateAssessmentResult(context, submittedSession),
  };
}
