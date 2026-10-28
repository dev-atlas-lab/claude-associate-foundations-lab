import {
  calculateAttemptResult,
  countReviewResolutions,
  reviewKey,
  type AssessmentResult,
  type AttemptOrigin,
  type Blueprint,
  type Question,
  type QuestionBankEntry,
  type QuestionScore,
  type ReviewReason,
  type StudyState,
  type TimedExamSession,
  type TimedExamSubmissionReason,
} from "../../domain";
import {
  getLessonForDomain,
  getLessonForObjective,
  getPracticeSet,
  getPracticeSetForDomain,
} from "../../content";
import { mockExamDefinition } from "../../content/mock-exam";

/**
 * Verified Timed-Exam Submission & Aggregation Contract:
 *
 * 1. Submission State & Cross-Field Invariants:
 *    - A `TimedExamSession` (`cfl.timed-exam.v1`) is eligible for submitted
 *      aggregation iff `timedSession.session.status === "submitted"`,
 *      `timedSession.session.submittedAt` is a valid ISO timestamp,
 *      `timedSession.submissionReason` is `"user" | "time-expired"`,
 *      `timedSession.finalResult` is present, and all cross-field invariants
 *      (`session.id === id`, `session.assessmentId === assessmentId`,
 *      `finalResult.sessionId === id`, `finalResult.assessmentId === assessmentId`,
 *      `finalResult.submittedAt === session.submittedAt`, matching question order
 *      and score counts, and valid `startedAt`/`deadlineAt` instants) hold.
 *    - Active (`status === "in-progress"`) or incomplete sessions are never
 *      included in submitted history, personal performance, or mistake review.
 * 2. Identifiers & Deduplication:
 *    - `timedSession.id` equals `timedSession.session.id` and
 *      `timedSession.finalResult.sessionId`.
 *    - Both submitted-attempt aggregation and review-item aggregation share the
 *      exact same eligibility and deduplication pipeline (`collectSubmittedAttempts`).
 *    - Only eligible *submitted* study attempts reserve their `session.id` in the
 *      deduplication set; an `in-progress` or invalid study attempt can never
 *      suppress a submitted timed session.
 * 3. Answer Records & Flags:
 *    - Per-question outcomes (`correct`, `incorrect`, `unanswered`),
 *      `selectedChoiceIds`, and `correctChoiceIds` are read from the immutable
 *      `timedSession.finalResult.questions` snapshot (never recalculated).
 *    - Flagged question IDs live on `timedSession.session.flaggedQuestionIds`.
 */

export interface DomainBankCoverage {
  domainId: string;
  code: string;
  title: string;
  weightPercent: number;
  itemCount: number;
  objectivesCovered: number;
  objectivesTotal: number;
}

export interface DomainPerformance {
  domainId: string;
  code: string;
  title: string;
  weightPercent: number;
  bankItemCount: number;
  uniqueAttemptedItems: number;
  uniqueAnsweredItems: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  accuracyOnAnswered?: number;
  firstSeenCorrectAnswers: number;
  firstSeenAnsweredItems: number;
  firstSeenAccuracy?: number;
  firstSeenOrderUnavailable: boolean;
  latestCorrectAnswers: number;
  latestAnsweredItems: number;
  latestAccuracy?: number;
  latestOrderUnavailable: boolean;
  lessonId?: string;
  lessonTitle?: string;
  practiceSetId?: string;
  practiceSetTitle?: string;
}

/**
 * Descriptive bank-level signal for an objective. Because the reviewed bank has
 * only 2-4 items per objective, labels describe observed status on the bank
 * items rather than claiming mastery or real-exam readiness.
 */
export type ObjectiveCoverageSignal =
  | "not-practiced"
  | "unanswered-only"
  | "order-unavailable"
  | "needs-review"
  | "partial-bank-correct"
  | "all-bank-items-correct";

export interface ObjectivePerformance {
  objectiveId: string;
  domainId: string;
  domainCode: string;
  domainTitle: string;
  statement: string;
  bankItemCount: number;
  /** Number of bank items for this objective that have appeared in at least one eligible submitted attempt (`answeredItemCount + unansweredItemCount`). */
  practicedItemCount: number;
  /** Number of bank items for this objective that have never appeared in any eligible submitted attempt (`bankItemCount - practicedItemCount`). */
  unpracticedItemCount: number;
  /** Number of practiced bank items for this objective that have been answered (`correct` or `incorrect`) at least once. */
  answeredItemCount: number;
  /** Number of practiced bank items for this objective that were seen in submitted attempts but never answered (`practicedItemCount - answeredItemCount`). */
  unansweredItemCount: number;
  firstSeenCorrectCount: number;
  firstSeenAnsweredCount: number;
  firstSeenOrderUnavailable: boolean;
  latestCorrectCount: number;
  latestIncorrectCount: number;
  latestOrderUnavailable: boolean;
  signal: ObjectiveCoverageSignal;
  signalLabel: string;
  lessonId?: string;
  lessonTitle?: string;
  practiceSetId?: string;
  practiceSetTitle?: string;
}

export interface AccuracyMetricSummary {
  correct: number;
  answered: number;
  percentage?: number;
  status: "available" | "no-answered-questions" | "order-unavailable";
  note: string;
}

export type AttemptHistorySource =
  | "practice"
  | "mock-exam-preview"
  | "timed-mock-exam";

export interface AttemptHistoryEntry {
  attemptId: string;
  assessmentId: string;
  title: string;
  source: AttemptHistorySource;
  storageKey: "cfl.study.v1" | "cfl.timed-exam.v1";
  startedAt: string;
  submittedAt: string;
  submissionReason?: TimedExamSubmissionReason;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  flaggedQuestions: number;
  rawPercentage: number;
}

export interface AttemptDomainBreakdownRow {
  domainId: string;
  code: string;
  title: string;
  weightPercent: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  accuracyOnAnswered?: number;
  rawPercentage?: number;
  lessonId?: string;
  lessonTitle?: string;
  practiceSetId?: string;
  practiceSetTitle?: string;
}

export interface AttemptObjectiveBreakdownRow {
  objectiveId: string;
  domainId: string;
  domainCode: string;
  domainTitle: string;
  statement: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  lessonId?: string;
  lessonTitle?: string;
  practiceSetId?: string;
  practiceSetTitle?: string;
}

export interface AggregatedReviewItem {
  key: string;
  attemptId: string;
  assessmentId: string;
  source: AttemptHistorySource;
  storageKey: "cfl.study.v1" | "cfl.timed-exam.v1";
  originLabel: string;
  submittedAt: string;
  submissionReason?: TimedExamSubmissionReason;
  question: Question;
  score: QuestionScore;
  reasons: ReviewReason[];
  resolvableInStudyStore: boolean;
  domainId?: string;
  domainCode?: string;
  domainTitle?: string;
  objectiveId?: string;
  objectiveStatement?: string;
  lessonId?: string;
  lessonTitle?: string;
  practiceSetId?: string;
  practiceSetTitle?: string;
  /** Number of eligible submitted attempts in which this question was answered incorrectly (`outcome === "incorrect"`). Never counts unanswered skips or flagged-correct answers. */
  repeatMissCount: number;
  /** Number of eligible submitted attempts in which this question was left unanswered (`outcome === "unanswered"`). */
  unansweredAttemptCount: number;
}

export interface ProgressSummary {
  bank: {
    totalItems: number;
    singleChoiceItems: number;
    multipleResponseItems: number;
    objectivesCovered: number;
    objectivesTotal: number;
    domainsWithItems: number;
    domains: DomainBankCoverage[];
  };
  personal: {
    submittedAttempts: number;
    studySubmittedAttempts: number;
    timedSubmittedAttempts: number;
    uniqueItemsAttempted: number;
    uniqueItemsAnswered: number;
    objectivesPracticed: number;
    objectivesAnswered: number;
    answeredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unansweredQuestions: number;
    accuracyOnAnswered?: number;
    rawPercentage?: number;
    firstSeen: AccuracyMetricSummary;
    latest: AccuracyMetricSummary;
    cumulative: AccuracyMetricSummary;
    lastSubmittedAt?: string;
    domains: DomainPerformance[];
    objectives: ObjectivePerformance[];
    attemptHistory: AttemptHistoryEntry[];
  };
  review: {
    unresolved: number;
    studyUnresolved: number;
    timedUnresolved: number;
    resolved: number;
  };
}

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}

function percentage(numerator: number, denominator: number): number | undefined {
  if (denominator === 0) {
    return undefined;
  }

  return roundPercentage((numerator / denominator) * 100);
}

function parseTimestampMs(value: string | undefined): number | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : undefined;
}

function compareTimestampStringsAsc(left: string, right: string): number {
  const leftMs = parseTimestampMs(left);
  const rightMs = parseTimestampMs(right);

  if (leftMs !== undefined && rightMs !== undefined) {
    return leftMs - rightMs;
  }

  if (leftMs !== undefined) {
    return -1;
  }

  if (rightMs !== undefined) {
    return 1;
  }

  return 0;
}

function compareTimestampStringsDesc(left: string, right: string): number {
  return compareTimestampStringsAsc(right, left);
}

/**
 * Verify that a timed-exam session is genuinely submitted, holds a complete
 * immutable result snapshot, and satisfies cross-field invariants. In-progress
 * or malformed sessions are rejected.
 */
export function isSubmittedTimedExamSession(
  timedSession: TimedExamSession | null | undefined,
): timedSession is TimedExamSession & {
  session: TimedExamSession["session"] & { submittedAt: string };
  submissionReason: TimedExamSubmissionReason;
  finalResult: AssessmentResult;
} {
  if (
    timedSession === undefined ||
    timedSession === null ||
    timedSession.session.status !== "submitted" ||
    typeof timedSession.session.submittedAt !== "string" ||
    timedSession.session.submittedAt.trim().length === 0 ||
    (timedSession.submissionReason !== "user" &&
      timedSession.submissionReason !== "time-expired") ||
    timedSession.finalResult === undefined
  ) {
    return false;
  }

  const { session, questionIds, finalResult } = timedSession;

  if (
    session.id !== timedSession.id ||
    session.assessmentId !== timedSession.assessmentId ||
    questionIds.length === 0 ||
    new Set(questionIds).size !== questionIds.length
  ) {
    return false;
  }

  const startedAtMs = parseTimestampMs(session.startedAt);
  const submittedAtMs = parseTimestampMs(session.submittedAt);
  const deadlineAtMs = parseTimestampMs(timedSession.deadlineAt);

  if (
    startedAtMs === undefined ||
    submittedAtMs === undefined ||
    deadlineAtMs === undefined ||
    !Number.isInteger(timedSession.durationMinutes) ||
    timedSession.durationMinutes <= 0 ||
    deadlineAtMs !== startedAtMs + timedSession.durationMinutes * 60_000
  ) {
    return false;
  }

  if (
    finalResult.sessionId !== timedSession.id ||
    finalResult.assessmentId !== timedSession.assessmentId ||
    finalResult.submittedAt !== session.submittedAt ||
    finalResult.totalQuestions !== questionIds.length ||
    finalResult.questions.length !== questionIds.length
  ) {
    return false;
  }

  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (let index = 0; index < questionIds.length; index += 1) {
    const score = finalResult.questions[index];

    if (!score || score.questionId !== questionIds[index]) {
      return false;
    }

    if (score.isCorrect !== (score.outcome === "correct")) {
      return false;
    }

    if (score.outcome === "correct") {
      correct += 1;
    } else if (score.outcome === "incorrect") {
      incorrect += 1;
    } else if (score.outcome === "unanswered") {
      unanswered += 1;
    } else {
      return false;
    }
  }

  const expectedAnswered = finalResult.totalQuestions - unanswered;
  const expectedRawPercentage =
    finalResult.totalQuestions === 0
      ? 0
      : roundPercentage((correct / finalResult.totalQuestions) * 100);

  if (
    finalResult.correctAnswers !== correct ||
    finalResult.incorrectAnswers !== incorrect ||
    finalResult.unansweredQuestions !== unanswered ||
    finalResult.answeredQuestions !== expectedAnswered ||
    finalResult.rawPercentage !== expectedRawPercentage
  ) {
    return false;
  }

  return true;
}

interface NormalizedSubmittedAttempt {
  attemptId: string;
  assessmentId: string;
  title: string;
  source: AttemptHistorySource;
  storageKey: "cfl.study.v1" | "cfl.timed-exam.v1";
  startedAt: string;
  submittedAt: string;
  submissionReason?: TimedExamSubmissionReason;
  flaggedQuestionIds: readonly string[];
  result: AssessmentResult;
}

function resolveStudyAttemptTitle(origin: AttemptOrigin, assessmentId: string): string {
  if (origin.kind === "practice") {
    return getPracticeSet(origin.practiceSetId)?.assessment.title ?? assessmentId;
  }

  if (assessmentId === mockExamDefinition.id) {
    return mockExamDefinition.title;
  }

  return "Mock exam preview";
}

/**
 * Collect all submitted attempts across `cfl.study.v1` and `cfl.timed-exam.v1`.
 *
 * - Active (`in-progress`) attempts are never included and never reserve an ID
 *   in `seenAttemptIds`.
 * - Every question in the attempt must resolve in `questionById` and have no
 *   duplicate question IDs.
 * - If a submitted timed session shares an ID with an eligible submitted study
 *   attempt, it is deduplicated so it cannot double-count metrics or review items.
 */
function collectSubmittedAttempts(
  state: StudyState,
  questionById: ReadonlyMap<string, Question>,
  timedSession?: TimedExamSession | null,
): NormalizedSubmittedAttempt[] {
  const seenAttemptIds = new Set<string>();
  const collected: NormalizedSubmittedAttempt[] = [];

  for (const attempt of state.attempts) {
    if (attempt.session.status !== "submitted") {
      continue;
    }

    if (seenAttemptIds.has(attempt.session.id)) {
      continue;
    }

    if (
      attempt.questionIds.length === 0 ||
      new Set(attempt.questionIds).size !== attempt.questionIds.length ||
      attempt.questionIds.some((questionId) => !questionById.has(questionId))
    ) {
      continue;
    }

    const submittedAt =
      typeof attempt.session.submittedAt === "string"
        ? attempt.session.submittedAt
        : "";
    const normalizedAttempt =
      attempt.session.submittedAt === submittedAt
        ? attempt
        : {
            ...attempt,
            session: {
              ...attempt.session,
              submittedAt,
            },
          };

    seenAttemptIds.add(attempt.session.id);
    const result = calculateAttemptResult(normalizedAttempt, questionById);

    collected.push({
      attemptId: attempt.session.id,
      assessmentId: attempt.session.assessmentId,
      title: resolveStudyAttemptTitle(attempt.origin, attempt.session.assessmentId),
      source: attempt.origin.kind === "practice" ? "practice" : "mock-exam-preview",
      storageKey: "cfl.study.v1",
      startedAt:
        typeof attempt.session.startedAt === "string"
          ? attempt.session.startedAt
          : "",
      submittedAt,
      flaggedQuestionIds: attempt.session.flaggedQuestionIds,
      result,
    });
  }

  if (
    isSubmittedTimedExamSession(timedSession) &&
    !seenAttemptIds.has(timedSession.id) &&
    timedSession.questionIds.every((questionId) => questionById.has(questionId))
  ) {
    seenAttemptIds.add(timedSession.id);
    collected.push({
      attemptId: timedSession.id,
      assessmentId: timedSession.assessmentId,
      title: "CCAO-F timed mock exam",
      source: "timed-mock-exam",
      storageKey: "cfl.timed-exam.v1",
      startedAt:
        typeof timedSession.session.startedAt === "string"
          ? timedSession.session.startedAt
          : "",
      submittedAt: timedSession.session.submittedAt,
      submissionReason: timedSession.submissionReason,
      flaggedQuestionIds: timedSession.session.flaggedQuestionIds,
      result: timedSession.finalResult,
    });
  }

  return collected;
}

interface QuestionEncounter {
  attemptId: string;
  submittedAt: string;
  startedAt: string;
  submittedAtMs: number | undefined;
  startedAtMs: number | undefined;
  outcome: QuestionScore["outcome"];
  isCorrect: boolean;
}

interface QuestionEncounterSummary {
  questionId: string;
  attemptedCount: number;
  answeredCount: number;
  unansweredCount: number;
  incorrectCount: number;
  firstSeen?: {
    outcome: "correct" | "incorrect";
    isCorrect: boolean;
    attemptId: string;
    submittedAt: string;
  };
  latest?: {
    outcome: "correct" | "incorrect";
    isCorrect: boolean;
    attemptId: string;
    submittedAt: string;
  };
  hasAmbiguousFirstSeenOrder: boolean;
  hasAmbiguousLatestOrder: boolean;
}

function compareEncountersChronologically(
  left: QuestionEncounter,
  right: QuestionEncounter,
): number {
  if (left.submittedAtMs !== undefined && right.submittedAtMs !== undefined) {
    const submittedDiff = left.submittedAtMs - right.submittedAtMs;
    if (submittedDiff !== 0) {
      return submittedDiff;
    }
  } else if (left.submittedAtMs !== undefined) {
    return -1;
  } else if (right.submittedAtMs !== undefined) {
    return 1;
  }

  if (left.startedAtMs !== undefined && right.startedAtMs !== undefined) {
    const startedDiff = left.startedAtMs - right.startedAtMs;
    if (startedDiff !== 0) {
      return startedDiff;
    }
  } else if (left.startedAtMs !== undefined) {
    return -1;
  } else if (right.startedAtMs !== undefined) {
    return 1;
  }

  return left.attemptId.localeCompare(right.attemptId);
}

function summarizeQuestionEncounters(
  submittedAttempts: readonly NormalizedSubmittedAttempt[],
): ReadonlyMap<string, QuestionEncounterSummary> {
  const encountersByQuestionId = new Map<string, QuestionEncounter[]>();

  for (const attempt of submittedAttempts) {
    const submittedAtMs = parseTimestampMs(attempt.submittedAt);
    const startedAtMs = parseTimestampMs(attempt.startedAt);

    for (const score of attempt.result.questions) {
      const list = encountersByQuestionId.get(score.questionId) ?? [];
      list.push({
        attemptId: attempt.attemptId,
        submittedAt: attempt.submittedAt,
        startedAt: attempt.startedAt,
        submittedAtMs,
        startedAtMs,
        outcome: score.outcome,
        isCorrect: score.isCorrect,
      });
      encountersByQuestionId.set(score.questionId, list);
    }
  }

  const summaries = new Map<string, QuestionEncounterSummary>();

  for (const [questionId, encounters] of encountersByQuestionId.entries()) {
    const answered = encounters
      .filter((encounter) => encounter.outcome !== "unanswered")
      .sort(compareEncountersChronologically);
    const unansweredCount = encounters.filter(
      (encounter) => encounter.outcome === "unanswered",
    ).length;
    const incorrectCount = encounters.filter(
      (encounter) => encounter.outcome === "incorrect",
    ).length;

    const hasInvalidTimestamp = answered.some(
      (encounter) =>
        encounter.submittedAtMs === undefined ||
        encounter.startedAtMs === undefined,
    );

    let hasAmbiguousFirstSeenOrder = hasInvalidTimestamp;
    let hasAmbiguousLatestOrder = hasInvalidTimestamp;

    if (!hasInvalidTimestamp && answered.length >= 2) {
      const earliest = answered[0]!;
      const earliestTied = answered.filter(
        (encounter) =>
          encounter.submittedAtMs === earliest.submittedAtMs &&
          encounter.startedAtMs === earliest.startedAtMs,
      );
      if (
        earliestTied.some(
          (encounter) => encounter.isCorrect !== earliest.isCorrect,
        )
      ) {
        hasAmbiguousFirstSeenOrder = true;
      }

      const latest = answered[answered.length - 1]!;
      const latestTied = answered.filter(
        (encounter) =>
          encounter.submittedAtMs === latest.submittedAtMs &&
          encounter.startedAtMs === latest.startedAtMs,
      );
      if (
        latestTied.some((encounter) => encounter.isCorrect !== latest.isCorrect)
      ) {
        hasAmbiguousLatestOrder = true;
      }
    }

    const firstAnswered = !hasAmbiguousFirstSeenOrder ? answered[0] : undefined;
    const latestAnswered = !hasAmbiguousLatestOrder
      ? answered[answered.length - 1]
      : undefined;

    summaries.set(questionId, {
      questionId,
      attemptedCount: encounters.length,
      answeredCount: answered.length,
      unansweredCount,
      incorrectCount,
      firstSeen: firstAnswered
        ? {
            outcome: firstAnswered.isCorrect ? "correct" : "incorrect",
            isCorrect: firstAnswered.isCorrect,
            attemptId: firstAnswered.attemptId,
            submittedAt: firstAnswered.submittedAt,
          }
        : undefined,
      latest: latestAnswered
        ? {
            outcome: latestAnswered.isCorrect ? "correct" : "incorrect",
            isCorrect: latestAnswered.isCorrect,
            attemptId: latestAnswered.attemptId,
            submittedAt: latestAnswered.submittedAt,
          }
        : undefined,
      hasAmbiguousFirstSeenOrder,
      hasAmbiguousLatestOrder,
    });
  }

  return summaries;
}

function classifyObjectiveSignal(
  bankItemCount: number,
  practicedItemCount: number,
  answeredItemCount: number,
  unansweredItemCount: number,
  latestCorrectCount: number,
  latestIncorrectCount: number,
  latestOrderUnavailable: boolean,
): { signal: ObjectiveCoverageSignal; signalLabel: string } {
  if (practicedItemCount === 0) {
    return {
      signal: "not-practiced",
      signalLabel: `Not practiced (0/${bankItemCount} bank items seen)`,
    };
  }

  if (answeredItemCount === 0) {
    return {
      signal: "unanswered-only",
      signalLabel: `Practiced but unanswered (${unansweredItemCount}/${bankItemCount} bank items seen, 0/${bankItemCount} answered)`,
    };
  }

  if (latestOrderUnavailable) {
    return {
      signal: "order-unavailable",
      signalLabel: `Latest order unavailable (${answeredItemCount}/${bankItemCount} bank items answered; conflicting outcomes at identical or invalid timestamps)`,
    };
  }

  if (latestIncorrectCount > 0 || latestCorrectCount === 0) {
    return {
      signal: "needs-review",
      signalLabel: `Needs review (${latestCorrectCount}/${bankItemCount} bank items correct on latest)`,
    };
  }

  if (latestCorrectCount < bankItemCount) {
    return {
      signal: "partial-bank-correct",
      signalLabel: `Partially practiced (${latestCorrectCount}/${bankItemCount} bank items correct on latest)`,
    };
  }

  return {
    signal: "all-bank-items-correct",
    signalLabel: `All ${bankItemCount}/${bankItemCount} bank items correct on latest (limited bank depth)`,
  };
}

/**
 * Derive a per-domain score breakdown for a single submitted assessment result
 * (such as `/mock-exam`, `/mock-exam/timed`, or `mixed-foundations-set`).
 * Domains with 0 questions in the result are omitted so single-domain or
 * subset runs only list relevant domains.
 */
export function deriveAttemptDomainBreakdown(
  result: AssessmentResult,
  bankEntries: readonly QuestionBankEntry[],
  blueprint: Blueprint,
): AttemptDomainBreakdownRow[] {
  const domainIdByObjectiveId = new Map<string, string>();

  for (const domain of blueprint.domains) {
    for (const objective of domain.objectives) {
      domainIdByObjectiveId.set(objective.id, domain.id);
    }
  }

  const bankByQuestionId = new Map(
    bankEntries.map((entry) => [entry.question.id, entry]),
  );

  const rows = blueprint.domains.map<AttemptDomainBreakdownRow>((domain) => {
    const lesson = getLessonForDomain(domain.id);
    const practiceSet = getPracticeSetForDomain(domain.id);

    return {
      domainId: domain.id,
      code: domain.code,
      title: domain.title,
      weightPercent: domain.weightPercent ?? 0,
      totalQuestions: 0,
      answeredQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      unansweredQuestions: 0,
      accuracyOnAnswered: undefined,
      rawPercentage: undefined,
      lessonId: lesson?.id,
      lessonTitle: lesson?.title,
      practiceSetId: practiceSet?.assessment.id,
      practiceSetTitle: practiceSet?.assessment.title,
    };
  });

  const rowByDomainId = new Map(rows.map((row) => [row.domainId, row]));

  for (const score of result.questions) {
    const entry = bankByQuestionId.get(score.questionId);
    const primaryObjectiveId = entry?.examMapping.objectiveIds[0];
    const domainId = primaryObjectiveId
      ? domainIdByObjectiveId.get(primaryObjectiveId)
      : undefined;
    const row = domainId ? rowByDomainId.get(domainId) : undefined;

    if (!row) {
      continue;
    }

    row.totalQuestions += 1;

    if (score.outcome === "unanswered") {
      row.unansweredQuestions += 1;
    } else {
      row.answeredQuestions += 1;
    }

    if (score.outcome === "correct") {
      row.correctAnswers += 1;
    } else if (score.outcome === "incorrect") {
      row.incorrectAnswers += 1;
    }
  }

  for (const row of rows) {
    row.accuracyOnAnswered = percentage(row.correctAnswers, row.answeredQuestions);
    row.rawPercentage = percentage(row.correctAnswers, row.totalQuestions);
  }

  return rows.filter((row) => row.totalQuestions > 0);
}

/**
 * Derive a per-objective score breakdown for a single submitted assessment
 * result. Objectives with 0 questions in the result are omitted.
 */
export function deriveAttemptObjectiveBreakdown(
  result: AssessmentResult,
  bankEntries: readonly QuestionBankEntry[],
  blueprint: Blueprint,
): AttemptObjectiveBreakdownRow[] {
  const bankByQuestionId = new Map(
    bankEntries.map((entry) => [entry.question.id, entry]),
  );

  const rows: AttemptObjectiveBreakdownRow[] = [];
  const rowByObjectiveId = new Map<string, AttemptObjectiveBreakdownRow>();

  for (const domain of blueprint.domains) {
    const practiceSet = getPracticeSetForDomain(domain.id);

    for (const objective of domain.objectives) {
      const lesson =
        getLessonForObjective(objective.id) ?? getLessonForDomain(domain.id);
      const row: AttemptObjectiveBreakdownRow = {
        objectiveId: objective.id,
        domainId: domain.id,
        domainCode: domain.code,
        domainTitle: domain.title,
        statement: objective.statement,
        totalQuestions: 0,
        answeredQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unansweredQuestions: 0,
        lessonId: lesson?.id,
        lessonTitle: lesson?.title,
        practiceSetId: practiceSet?.assessment.id,
        practiceSetTitle: practiceSet?.assessment.title,
      };
      rows.push(row);
      rowByObjectiveId.set(objective.id, row);
    }
  }

  for (const score of result.questions) {
    const entry = bankByQuestionId.get(score.questionId);
    const primaryObjectiveId = entry?.examMapping.objectiveIds[0];
    const row = primaryObjectiveId
      ? rowByObjectiveId.get(primaryObjectiveId)
      : undefined;

    if (!row) {
      continue;
    }

    row.totalQuestions += 1;

    if (score.outcome === "unanswered") {
      row.unansweredQuestions += 1;
    } else {
      row.answeredQuestions += 1;
    }

    if (score.outcome === "correct") {
      row.correctAnswers += 1;
    } else if (score.outcome === "incorrect") {
      row.incorrectAnswers += 1;
    }
  }

  return rows.filter((row) => row.totalQuestions > 0);
}

function enrichReviewItem(
  base: {
    key: string;
    attemptId: string;
    assessmentId: string;
    source: AttemptHistorySource;
    storageKey: "cfl.study.v1" | "cfl.timed-exam.v1";
    originLabel: string;
    submittedAt: string;
    submissionReason?: TimedExamSubmissionReason;
    question: Question;
    score: QuestionScore;
    reasons: ReviewReason[];
    resolvableInStudyStore: boolean;
  },
  bankByQuestionId: ReadonlyMap<string, QuestionBankEntry>,
  objectiveLookup: ReadonlyMap<
    string,
    { domainId: string; domainCode: string; domainTitle: string; statement: string }
  >,
  incorrectCountByQuestionId: ReadonlyMap<string, number>,
  unansweredCountByQuestionId: ReadonlyMap<string, number>,
): AggregatedReviewItem {
  const entry = bankByQuestionId.get(base.question.id);
  const primaryObjectiveId = entry?.examMapping.objectiveIds[0];
  const objectiveMeta = primaryObjectiveId
    ? objectiveLookup.get(primaryObjectiveId)
    : undefined;
  const lesson = primaryObjectiveId
    ? getLessonForObjective(primaryObjectiveId) ??
      (objectiveMeta ? getLessonForDomain(objectiveMeta.domainId) : undefined)
    : undefined;
  const practiceSet = objectiveMeta
    ? getPracticeSetForDomain(objectiveMeta.domainId)
    : undefined;

  return {
    ...base,
    domainId: objectiveMeta?.domainId,
    domainCode: objectiveMeta?.domainCode,
    domainTitle: objectiveMeta?.domainTitle,
    objectiveId: primaryObjectiveId,
    objectiveStatement: objectiveMeta?.statement,
    lessonId: lesson?.id,
    lessonTitle: lesson?.title,
    practiceSetId: practiceSet?.assessment.id,
    practiceSetTitle: practiceSet?.assessment.title,
    repeatMissCount: incorrectCountByQuestionId.get(base.question.id) ?? 0,
    unansweredAttemptCount: unansweredCountByQuestionId.get(base.question.id) ?? 0,
  };
}

/**
 * Read-only aggregation of mistake/flag review items across `cfl.study.v1` and
 * `cfl.timed-exam.v1`.
 *
 * - Shares `collectSubmittedAttempts(state, questionById, timedSession)` with
 *   `deriveProgressSummary`, guaranteeing identical attempt eligibility,
 *   question-bank validity checks, and deduplication.
 * - Study review items respect `state.reviewResolutions`.
 * - Submitted timed-exam review items (`incorrect`, `unanswered`, or `flagged`
 *   in `timedSession.finalResult`) are included when `timedSession` passes
 *   `isSubmittedTimedExamSession` and its `id` is not already claimed by an
 *   eligible submitted study attempt.
 * - Active/in-progress attempts (whether in `cfl.study.v1` or `cfl.timed-exam.v1`)
 *   are never included and never suppress an eligible submitted timed attempt.
 */
export function deriveAggregatedReviewItems(
  state: StudyState,
  questionById: ReadonlyMap<string, Question>,
  bankEntries: readonly QuestionBankEntry[],
  blueprint: Blueprint,
  timedSession?: TimedExamSession | null,
): AggregatedReviewItem[] {
  const bankByQuestionId = new Map(
    bankEntries.map((entry) => [entry.question.id, entry]),
  );
  const objectiveLookup = new Map<
    string,
    { domainId: string; domainCode: string; domainTitle: string; statement: string }
  >();

  for (const domain of blueprint.domains) {
    for (const objective of domain.objectives) {
      objectiveLookup.set(objective.id, {
        domainId: domain.id,
        domainCode: domain.code,
        domainTitle: domain.title,
        statement: objective.statement,
      });
    }
  }

  const submittedAttempts = collectSubmittedAttempts(state, questionById, timedSession);
  const incorrectCountByQuestionId = new Map<string, number>();
  const unansweredCountByQuestionId = new Map<string, number>();

  for (const attempt of submittedAttempts) {
    for (const score of attempt.result.questions) {
      if (score.outcome === "incorrect") {
        incorrectCountByQuestionId.set(
          score.questionId,
          (incorrectCountByQuestionId.get(score.questionId) ?? 0) + 1,
        );
      } else if (score.outcome === "unanswered") {
        unansweredCountByQuestionId.set(
          score.questionId,
          (unansweredCountByQuestionId.get(score.questionId) ?? 0) + 1,
        );
      }
    }
  }

  const resolvedKeys = new Set(
    state.reviewResolutions.map((resolution) =>
      reviewKey(resolution.attemptId, resolution.questionId),
    ),
  );

  const aggregated: AggregatedReviewItem[] = [];

  for (const attempt of submittedAttempts) {
    for (const score of attempt.result.questions) {
      const reasons: ReviewReason[] = [];

      if (score.outcome === "incorrect") {
        reasons.push("incorrect");
      }

      if (score.outcome === "unanswered") {
        reasons.push("unanswered");
      }

      if (attempt.flaggedQuestionIds.includes(score.questionId)) {
        reasons.push("flagged");
      }

      if (reasons.length === 0) {
        continue;
      }

      const key = reviewKey(attempt.attemptId, score.questionId);

      if (resolvedKeys.has(key)) {
        continue;
      }

      const question = questionById.get(score.questionId);

      if (!question) {
        continue;
      }

      aggregated.push(
        enrichReviewItem(
          {
            key,
            attemptId: attempt.attemptId,
            assessmentId: attempt.assessmentId,
            source: attempt.source,
            storageKey: attempt.storageKey,
            originLabel: attempt.title,
            submittedAt: attempt.submittedAt,
            submissionReason: attempt.submissionReason,
            question,
            score,
            reasons,
            resolvableInStudyStore: attempt.storageKey === "cfl.study.v1",
          },
          bankByQuestionId,
          objectiveLookup,
          incorrectCountByQuestionId,
          unansweredCountByQuestionId,
        ),
      );
    }
  }

  return aggregated.sort(
    (left, right) =>
      compareTimestampStringsDesc(left.submittedAt, right.submittedAt) ||
      left.question.id.localeCompare(right.question.id) ||
      left.attemptId.localeCompare(right.attemptId),
  );
}

/**
 * Progress separates what the bank contains from what this learner has done.
 * Bank coverage is derived from the reviewed registry; personal performance is
 * derived read-only from submitted attempts in `cfl.study.v1` and, when
 * present, the submitted attempt in `cfl.timed-exam.v1`.
 */
export function deriveProgressSummary(
  state: StudyState,
  bankEntries: readonly QuestionBankEntry[],
  blueprint: Blueprint,
  questionById: ReadonlyMap<string, Question>,
  timedSession?: TimedExamSession | null,
): ProgressSummary {
  const domainIdByObjectiveId = new Map<string, string>();

  for (const domain of blueprint.domains) {
    for (const objective of domain.objectives) {
      domainIdByObjectiveId.set(objective.id, domain.id);
    }
  }

  const bankByQuestionId = new Map(
    bankEntries.map((entry) => [entry.question.id, entry]),
  );
  const bankDomains = blueprint.domains.map<DomainBankCoverage>((domain) => ({
    domainId: domain.id,
    code: domain.code,
    title: domain.title,
    weightPercent: domain.weightPercent ?? 0,
    itemCount: 0,
    objectivesCovered: 0,
    objectivesTotal: domain.objectives.length,
  }));
  const bankDomainById = new Map(bankDomains.map((domain) => [domain.domainId, domain]));
  const coveredObjectiveIds = new Set<string>();
  const bankQuestionIdsByDomainId = new Map<string, string[]>();
  const bankQuestionIdsByObjectiveId = new Map<string, string[]>();

  for (const entry of bankEntries) {
    for (const objectiveId of entry.examMapping.objectiveIds) {
      const domainId = domainIdByObjectiveId.get(objectiveId);

      if (!domainId) {
        continue;
      }

      coveredObjectiveIds.add(objectiveId);
    }

    const primaryObjectiveId = entry.examMapping.objectiveIds[0];
    const primaryDomainId = primaryObjectiveId
      ? domainIdByObjectiveId.get(primaryObjectiveId)
      : undefined;
    const domain = primaryDomainId ? bankDomainById.get(primaryDomainId) : undefined;

    if (domain && primaryDomainId) {
      domain.itemCount += 1;
      const list = bankQuestionIdsByDomainId.get(primaryDomainId) ?? [];
      list.push(entry.question.id);
      bankQuestionIdsByDomainId.set(primaryDomainId, list);
    }

    if (primaryObjectiveId) {
      const objList = bankQuestionIdsByObjectiveId.get(primaryObjectiveId) ?? [];
      objList.push(entry.question.id);
      bankQuestionIdsByObjectiveId.set(primaryObjectiveId, objList);
    }
  }

  for (const domain of bankDomains) {
    const domainDefinition = blueprint.domains.find(
      (candidate) => candidate.id === domain.domainId,
    );
    domain.objectivesCovered =
      domainDefinition?.objectives.filter((objective) =>
        coveredObjectiveIds.has(objective.id),
      ).length ?? 0;
  }

  const submittedAttempts = collectSubmittedAttempts(state, questionById, timedSession);
  const encounterSummaries = summarizeQuestionEncounters(submittedAttempts);

  const performanceDomains = blueprint.domains.map<DomainPerformance>((domain) => {
    const lesson = getLessonForDomain(domain.id);
    const practiceSet = getPracticeSetForDomain(domain.id);
    const domainQuestionIds = bankQuestionIdsByDomainId.get(domain.id) ?? [];

    return {
      domainId: domain.id,
      code: domain.code,
      title: domain.title,
      weightPercent: domain.weightPercent ?? 0,
      bankItemCount: domainQuestionIds.length,
      uniqueAttemptedItems: 0,
      uniqueAnsweredItems: 0,
      attemptedQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      unansweredQuestions: 0,
      accuracyOnAnswered: undefined,
      firstSeenCorrectAnswers: 0,
      firstSeenAnsweredItems: 0,
      firstSeenAccuracy: undefined,
      firstSeenOrderUnavailable: false,
      latestCorrectAnswers: 0,
      latestAnsweredItems: 0,
      latestAccuracy: undefined,
      latestOrderUnavailable: false,
      lessonId: lesson?.id,
      lessonTitle: lesson?.title,
      practiceSetId: practiceSet?.assessment.id,
      practiceSetTitle: practiceSet?.assessment.title,
    };
  });
  const performanceDomainById = new Map(
    performanceDomains.map((domain) => [domain.domainId, domain]),
  );

  let answeredQuestions = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unansweredQuestions = 0;
  let lastSubmittedAt: string | undefined;
  let lastSubmittedAtMs: number | undefined;

  for (const attempt of submittedAttempts) {
    const attemptSubmittedMs = parseTimestampMs(attempt.submittedAt);
    if (
      attemptSubmittedMs !== undefined &&
      (lastSubmittedAtMs === undefined || attemptSubmittedMs > lastSubmittedAtMs)
    ) {
      lastSubmittedAtMs = attemptSubmittedMs;
      lastSubmittedAt = attempt.submittedAt;
    }

    for (const score of attempt.result.questions) {
      if (score.outcome === "unanswered") {
        unansweredQuestions += 1;
      } else {
        answeredQuestions += 1;
      }

      if (score.outcome === "correct") {
        correctAnswers += 1;
      } else if (score.outcome === "incorrect") {
        incorrectAnswers += 1;
      }

      const entry = bankByQuestionId.get(score.questionId);
      const objectiveId = entry?.examMapping.objectiveIds[0];
      const domainId = objectiveId ? domainIdByObjectiveId.get(objectiveId) : undefined;
      const domain = domainId ? performanceDomainById.get(domainId) : undefined;

      if (!domain) {
        continue;
      }

      domain.attemptedQuestions += 1;

      if (score.outcome === "correct") {
        domain.correctAnswers += 1;
      } else if (score.outcome === "incorrect") {
        domain.incorrectAnswers += 1;
      } else {
        domain.unansweredQuestions += 1;
      }
    }
  }

  let uniqueItemsAttempted = 0;
  let uniqueItemsAnswered = 0;
  let totalFirstSeenCorrect = 0;
  let totalFirstSeenAnswered = 0;
  let hasAnyAmbiguousFirstSeen = false;
  let totalLatestCorrect = 0;
  let totalLatestAnswered = 0;
  let hasAnyAmbiguousLatest = false;

  for (const entry of bankEntries) {
    const questionId = entry.question.id;
    const summary = encounterSummaries.get(questionId);
    const primaryObjectiveId = entry.examMapping.objectiveIds[0];
    const domainId = primaryObjectiveId
      ? domainIdByObjectiveId.get(primaryObjectiveId)
      : undefined;
    const domain = domainId ? performanceDomainById.get(domainId) : undefined;

    if (!summary) {
      continue;
    }

    if (summary.attemptedCount > 0) {
      uniqueItemsAttempted += 1;
      if (domain) {
        domain.uniqueAttemptedItems += 1;
      }
    }

    if (summary.answeredCount > 0) {
      uniqueItemsAnswered += 1;
      if (domain) {
        domain.uniqueAnsweredItems += 1;
      }
    }

    if (summary.hasAmbiguousFirstSeenOrder) {
      hasAnyAmbiguousFirstSeen = true;
      if (domain) {
        domain.firstSeenOrderUnavailable = true;
      }
    } else if (summary.firstSeen) {
      totalFirstSeenAnswered += 1;
      if (summary.firstSeen.isCorrect) {
        totalFirstSeenCorrect += 1;
      }
      if (domain) {
        domain.firstSeenAnsweredItems += 1;
        if (summary.firstSeen.isCorrect) {
          domain.firstSeenCorrectAnswers += 1;
        }
      }
    }

    if (summary.hasAmbiguousLatestOrder) {
      hasAnyAmbiguousLatest = true;
      if (domain) {
        domain.latestOrderUnavailable = true;
      }
    } else if (summary.latest) {
      totalLatestAnswered += 1;
      if (summary.latest.isCorrect) {
        totalLatestCorrect += 1;
      }
      if (domain) {
        domain.latestAnsweredItems += 1;
        if (summary.latest.isCorrect) {
          domain.latestCorrectAnswers += 1;
        }
      }
    }
  }

  for (const domain of performanceDomains) {
    domain.accuracyOnAnswered = percentage(
      domain.correctAnswers,
      domain.attemptedQuestions - domain.unansweredQuestions,
    );

    if (domain.firstSeenOrderUnavailable) {
      domain.firstSeenCorrectAnswers = 0;
      domain.firstSeenAnsweredItems = 0;
      domain.firstSeenAccuracy = undefined;
    } else {
      domain.firstSeenAccuracy = percentage(
        domain.firstSeenCorrectAnswers,
        domain.firstSeenAnsweredItems,
      );
    }

    if (domain.latestOrderUnavailable) {
      domain.latestCorrectAnswers = 0;
      domain.latestAnsweredItems = 0;
      domain.latestAccuracy = undefined;
    } else {
      domain.latestAccuracy = percentage(
        domain.latestCorrectAnswers,
        domain.latestAnsweredItems,
      );
    }
  }

  const objectivesPerformance: ObjectivePerformance[] = [];
  let objectivesPracticed = 0;
  let objectivesAnswered = 0;

  for (const domain of blueprint.domains) {
    const practiceSet = getPracticeSetForDomain(domain.id);

    for (const objective of domain.objectives) {
      const lesson =
        getLessonForObjective(objective.id) ?? getLessonForDomain(domain.id);
      const questionIds = bankQuestionIdsByObjectiveId.get(objective.id) ?? [];
      let practicedItemCount = 0;
      let answeredItemCount = 0;
      let unansweredItemCount = 0;
      let firstSeenCorrectCount = 0;
      let firstSeenAnsweredCount = 0;
      let firstSeenOrderUnavailable = false;
      let latestCorrectCount = 0;
      let latestIncorrectCount = 0;
      let latestOrderUnavailable = false;

      for (const questionId of questionIds) {
        const summary = encounterSummaries.get(questionId);

        if (!summary || summary.attemptedCount === 0) {
          continue;
        }

        practicedItemCount += 1;

        if (summary.answeredCount > 0) {
          answeredItemCount += 1;
        } else {
          unansweredItemCount += 1;
        }

        if (summary.hasAmbiguousFirstSeenOrder) {
          firstSeenOrderUnavailable = true;
        } else if (summary.firstSeen) {
          firstSeenAnsweredCount += 1;
          if (summary.firstSeen.isCorrect) {
            firstSeenCorrectCount += 1;
          }
        }

        if (summary.hasAmbiguousLatestOrder) {
          latestOrderUnavailable = true;
        } else if (summary.latest) {
          if (summary.latest.isCorrect) {
            latestCorrectCount += 1;
          } else {
            latestIncorrectCount += 1;
          }
        }
      }

      if (firstSeenOrderUnavailable) {
        firstSeenCorrectCount = 0;
        firstSeenAnsweredCount = 0;
      }

      if (latestOrderUnavailable) {
        latestCorrectCount = 0;
        latestIncorrectCount = 0;
      }

      if (practicedItemCount > 0) {
        objectivesPracticed += 1;
      }

      if (answeredItemCount > 0) {
        objectivesAnswered += 1;
      }

      const bankItemCount = questionIds.length;
      const unpracticedItemCount = bankItemCount - practicedItemCount;

      const { signal, signalLabel } = classifyObjectiveSignal(
        bankItemCount,
        practicedItemCount,
        answeredItemCount,
        unansweredItemCount,
        latestCorrectCount,
        latestIncorrectCount,
        latestOrderUnavailable,
      );

      objectivesPerformance.push({
        objectiveId: objective.id,
        domainId: domain.id,
        domainCode: domain.code,
        domainTitle: domain.title,
        statement: objective.statement,
        bankItemCount,
        practicedItemCount,
        unpracticedItemCount,
        answeredItemCount,
        unansweredItemCount,
        firstSeenCorrectCount,
        firstSeenAnsweredCount,
        firstSeenOrderUnavailable,
        latestCorrectCount,
        latestIncorrectCount,
        latestOrderUnavailable,
        signal,
        signalLabel,
        lessonId: lesson?.id,
        lessonTitle: lesson?.title,
        practiceSetId: practiceSet?.assessment.id,
        practiceSetTitle: practiceSet?.assessment.title,
      });
    }
  }

  const attemptHistory: AttemptHistoryEntry[] = [...submittedAttempts]
    .sort(
      (left, right) =>
        compareTimestampStringsDesc(left.submittedAt, right.submittedAt) ||
        compareTimestampStringsDesc(left.startedAt, right.startedAt) ||
        left.attemptId.localeCompare(right.attemptId),
    )
    .map((attempt) => ({
      attemptId: attempt.attemptId,
      assessmentId: attempt.assessmentId,
      title: attempt.title,
      source: attempt.source,
      storageKey: attempt.storageKey,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      submissionReason: attempt.submissionReason,
      totalQuestions: attempt.result.totalQuestions,
      answeredQuestions: attempt.result.answeredQuestions,
      correctAnswers: attempt.result.correctAnswers,
      incorrectAnswers: attempt.result.incorrectAnswers,
      unansweredQuestions: attempt.result.unansweredQuestions,
      flaggedQuestions: attempt.flaggedQuestionIds.length,
      rawPercentage: attempt.result.rawPercentage,
    }));

  const firstSeenSummary: AccuracyMetricSummary = hasAnyAmbiguousFirstSeen
    ? {
        correct: 0,
        answered: 0,
        percentage: undefined,
        status: "order-unavailable",
        note: "Unavailable because earliest answer order cannot be established (conflicting outcomes at identical timestamps or invalid/missing timestamps).",
      }
    : totalFirstSeenAnswered === 0
      ? {
          correct: 0,
          answered: 0,
          percentage: undefined,
          status: "no-answered-questions",
          note: "Earliest recorded answered result per unique bank question (no answered questions yet).",
        }
      : {
          correct: totalFirstSeenCorrect,
          answered: totalFirstSeenAnswered,
          percentage: percentage(totalFirstSeenCorrect, totalFirstSeenAnswered),
          status: "available",
          note: `Earliest recorded answered result across ${totalFirstSeenAnswered} unique answered bank questions.`,
        };

  const latestSummary: AccuracyMetricSummary = hasAnyAmbiguousLatest
    ? {
        correct: 0,
        answered: 0,
        percentage: undefined,
        status: "order-unavailable",
        note: "Unavailable because most recent answer order cannot be established (conflicting outcomes at identical timestamps or invalid/missing timestamps).",
      }
    : totalLatestAnswered === 0
      ? {
          correct: 0,
          answered: 0,
          percentage: undefined,
          status: "no-answered-questions",
          note: "Most recent recorded answered result per unique bank question (no answered questions yet).",
        }
      : {
          correct: totalLatestCorrect,
          answered: totalLatestAnswered,
          percentage: percentage(totalLatestCorrect, totalLatestAnswered),
          status: "available",
          note: `Most recent recorded answered result across ${totalLatestAnswered} unique answered bank questions.`,
        };

  const cumulativeSummary: AccuracyMetricSummary =
    answeredQuestions === 0
      ? {
          correct: 0,
          answered: 0,
          percentage: undefined,
          status: "no-answered-questions",
          note: "All eligible answered responses across submitted attempts (no answered questions yet).",
        }
      : {
          correct: correctAnswers,
          answered: answeredQuestions,
          percentage: percentage(correctAnswers, answeredQuestions),
          status: "available",
          note: `All ${answeredQuestions} answered responses across ${submittedAttempts.length} submitted ${submittedAttempts.length === 1 ? "attempt" : "attempts"}.`,
        };

  const totalQuestions = correctAnswers + incorrectAnswers + unansweredQuestions;
  const allAggregatedReview = deriveAggregatedReviewItems(
    state,
    questionById,
    bankEntries,
    blueprint,
    timedSession,
  );
  const studyUnresolved = allAggregatedReview.filter(
    (item) => item.storageKey === "cfl.study.v1",
  ).length;
  const timedUnresolved = allAggregatedReview.filter(
    (item) => item.storageKey === "cfl.timed-exam.v1",
  ).length;
  const studySubmittedAttempts = submittedAttempts.filter(
    (attempt) => attempt.storageKey === "cfl.study.v1",
  ).length;
  const timedSubmittedAttempts = submittedAttempts.filter(
    (attempt) => attempt.storageKey === "cfl.timed-exam.v1",
  ).length;

  return {
    bank: {
      totalItems: bankEntries.length,
      singleChoiceItems: bankEntries.filter(
        (entry) => entry.question.type === "single-choice",
      ).length,
      multipleResponseItems: bankEntries.filter(
        (entry) => entry.question.type === "multiple-response",
      ).length,
      objectivesCovered: coveredObjectiveIds.size,
      objectivesTotal: blueprint.domains.reduce(
        (total, domain) => total + domain.objectives.length,
      0,
      ),
      domainsWithItems: bankDomains.filter((domain) => domain.itemCount > 0).length,
      domains: bankDomains,
    },
    personal: {
      submittedAttempts: submittedAttempts.length,
      studySubmittedAttempts,
      timedSubmittedAttempts,
      uniqueItemsAttempted,
      uniqueItemsAnswered,
      objectivesPracticed,
      objectivesAnswered,
      answeredQuestions,
      correctAnswers,
      incorrectAnswers,
      unansweredQuestions,
      accuracyOnAnswered: percentage(correctAnswers, answeredQuestions),
      rawPercentage: percentage(correctAnswers, totalQuestions),
      firstSeen: firstSeenSummary,
      latest: latestSummary,
      cumulative: cumulativeSummary,
      lastSubmittedAt,
      domains: performanceDomains,
      objectives: objectivesPerformance,
      attemptHistory,
    },
    review: {
      unresolved: allAggregatedReview.length,
      studyUnresolved,
      timedUnresolved,
      resolved: countReviewResolutions(state),
    },
  };
}
