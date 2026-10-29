import { describe, expect, it } from "vitest";
import {
  allQuestions,
  getAssessment,
  getAssessmentQuestions,
  getLessonForDomain,
  getLessonForObjective,
  getPracticeSetForDomain,
  getQuestionCurriculumContext,
  primaryBlueprint,
  questionBankEntries,
} from "../content";
import {
  chooseAnswer,
  chooseTimedExamAnswer,
  createAssessmentContext,
  createStudyAttempt,
  createTimedExamContext,
  createTimedExamSession,
  emptyStudyState,
  expireTimedExam,
  resolveReviewItem,
  setQuestionFlag,
  startAssessment,
  submitAssessment,
  submitTimedExam,
  toggleTimedExamFlag,
  upsertStudyAttempt,
  type AssessmentDefinition,
  type StudyState,
  type TimedExamSession,
} from "../domain";
import {
  buildReviewPracticeSet,
  deriveAggregatedReviewItems,
  deriveAttemptDomainBreakdown,
  deriveAttemptObjectiveBreakdown,
  deriveProgressSummary,
  findCorrectlyAnsweredStudyReviewItems,
  isSubmittedTimedExamSession,
} from "../features/progress/selectors";
import {
  selectTimedExamQuestionIds,
  timedExamAssessmentId,
  timedExamBlueprintId,
  timedExamDurationMinutes,
  timedExamPolicy,
} from "../content/timed-exam";

const questionById = new Map(allQuestions.map((question) => [question.id, question]));
const domainTwoAssessment = getAssessment("domain-2-output-validation-set")!;
const domainTwoQuestions = getAssessmentQuestions(domainTwoAssessment);
const domainTwoContext = createAssessmentContext(domainTwoAssessment, domainTwoQuestions);

function buildSubmittedStudyAttempt(
  definition: AssessmentDefinition,
  options: {
    sessionId: string;
    startedAt: string;
    submittedAt: string;
    correctQuestionIds?: readonly string[];
    incorrectQuestionIds?: readonly string[];
    flaggedQuestionIds?: readonly string[];
  },
) {
  const questions = getAssessmentQuestions(definition);
  const context = createAssessmentContext(definition, questions);
  let session = startAssessment(context, {
    sessionId: options.sessionId,
    startedAt: options.startedAt,
  });

  for (const questionId of options.correctQuestionIds ?? []) {
    const question = questionById.get(questionId)!;
    session = chooseAnswer(context, session, questionId, question.correctChoiceIds);
  }

  for (const questionId of options.incorrectQuestionIds ?? []) {
    const question = questionById.get(questionId)!;
    const wrongChoice = question.choices.find(
      (choice) => !question.correctChoiceIds.includes(choice.id),
    )!;
    session = chooseAnswer(context, session, questionId, [wrongChoice.id]);
  }

  for (const questionId of options.flaggedQuestionIds ?? []) {
    session = setQuestionFlag(context, session, questionId, true);
  }

  const submitted = submitAssessment(context, session, options.submittedAt);

  return createStudyAttempt(definition, submitted.session, {
    kind: "practice",
    practiceSetId: definition.id,
  });
}

function submittedState() {
  const firstQuestion = domainTwoQuestions[0]!;
  const attempt = buildSubmittedStudyAttempt(domainTwoAssessment, {
    sessionId: "progress-attempt",
    startedAt: "2026-10-26T09:00:00.000Z",
    submittedAt: "2026-10-26T09:10:00.000Z",
    incorrectQuestionIds: [firstQuestion.id],
  });

  return upsertStudyAttempt(emptyStudyState, attempt);
}

describe("curriculum & remediation lookups", () => {
  it("resolves lessons and single-domain practice sets for every official domain and objective", () => {
    for (const domain of primaryBlueprint.domains) {
      const domainLesson = getLessonForDomain(domain.id);
      const practiceSet = getPracticeSetForDomain(domain.id);

      expect(domainLesson).toBeDefined();
      expect(domainLesson?.examMapping.status).toBe("verified");
      expect(practiceSet).toBeDefined();
      expect(practiceSet?.domains).toHaveLength(1);
      expect(practiceSet?.domains[0]?.id).toBe(domain.id);

      for (const objective of domain.objectives) {
        const objectiveLesson = getLessonForObjective(objective.id);
        expect(objectiveLesson?.id).toBe(domainLesson?.id);
      }
    }

    expect(getLessonForObjective("unknown-objective")).toBeUndefined();
    expect(getLessonForDomain("unknown-domain")).toBeUndefined();
    expect(getPracticeSetForDomain("unknown-domain")).toBeUndefined();
  });

  it("resolves full curriculum context for bank questions and keeps unmapped samples unmapped", () => {
    const context = getQuestionCurriculumContext("output-accuracy-review-plan");

    expect(context).toBeDefined();
    expect(context?.domain?.id).toBe("output-evaluation-validation");
    expect(context?.objective?.id).toBe("output-evaluate-accuracy");
    expect(context?.lesson?.id).toBe("evaluation-basics");
    expect(context?.practiceSet?.assessment.id).toBe("domain-2-output-validation-set");
    expect(context?.sources.length).toBeGreaterThan(0);

    const sampleContext = getQuestionCurriculumContext("context-window-root-cause");
    expect(sampleContext).toBeDefined();
    expect(sampleContext?.bankEntry).toBeUndefined();
    expect(sampleContext?.domain).toBeUndefined();
    expect(sampleContext?.objective).toBeUndefined();
    expect(sampleContext?.lesson).toBeUndefined();
  });
});

describe("progress summary and breakdown selectors", () => {
  it("reports bank coverage independently of personal activity", () => {
    const summary = deriveProgressSummary(
      emptyStudyState,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );

    expect(summary.bank.totalItems).toBe(72);
    expect(summary.bank.singleChoiceItems).toBe(38);
    expect(summary.bank.multipleResponseItems).toBe(34);
    expect(summary.bank.objectivesCovered).toBe(30);
    expect(summary.bank.objectivesTotal).toBe(30);
    expect(summary.bank.domainsWithItems).toBe(7);

    const domainFive = summary.bank.domains.find(
      (domain) => domain.domainId === "configuration-knowledge-management",
    );

    expect(domainFive?.itemCount).toBe(9);
    expect(domainFive?.objectivesCovered).toBe(4);
    expect(summary.bank.domains.every((domain) => domain.itemCount > 0)).toBe(true);
    expect(
      summary.bank.domains.every(
        (domain) => domain.objectivesCovered === domain.objectivesTotal,
      ),
    ).toBe(true);

    expect(summary.personal.submittedAttempts).toBe(0);
    expect(summary.personal.uniqueItemsAttempted).toBe(0);
    expect(summary.personal.uniqueItemsAnswered).toBe(0);
    expect(summary.personal.objectivesPracticed).toBe(0);
    expect(summary.personal.accuracyOnAnswered).toBeUndefined();
    expect(summary.personal.rawPercentage).toBeUndefined();
    expect(summary.personal.firstSeen.status).toBe("no-answered-questions");
    expect(summary.personal.latest.status).toBe("no-answered-questions");
    expect(summary.personal.cumulative.status).toBe("no-answered-questions");
    expect(summary.personal.objectives).toHaveLength(30);
    expect(
      summary.personal.objectives.every((objective) => objective.signal === "not-practiced"),
    ).toBe(true);
    expect(summary.personal.attemptHistory).toEqual([]);
    expect(summary.review).toEqual({
      unresolved: 0,
      studyUnresolved: 0,
      timedUnresolved: 0,
      resolved: 0,
    });
  });

  it("derives personal accuracy, objective signals, and review counts from submitted attempts", () => {
    const state = submittedState();
    const summary = deriveProgressSummary(
      state,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );

    expect(summary.bank.totalItems).toBe(72);
    expect(summary.personal.submittedAttempts).toBe(1);
    expect(summary.personal.studySubmittedAttempts).toBe(1);
    expect(summary.personal.timedSubmittedAttempts).toBe(0);
    expect(summary.personal.uniqueItemsAttempted).toBe(15);
    expect(summary.personal.uniqueItemsAnswered).toBe(1);
    expect(summary.personal.objectivesPracticed).toBe(6);
    expect(summary.personal.objectivesAnswered).toBe(1);
    expect(summary.personal.answeredQuestions).toBe(1);
    expect(summary.personal.correctAnswers).toBe(0);
    expect(summary.personal.incorrectAnswers).toBe(1);
    expect(summary.personal.unansweredQuestions).toBe(14);
    expect(summary.personal.accuracyOnAnswered).toBe(0);
    expect(summary.personal.rawPercentage).toBe(0);
    expect(summary.personal.lastSubmittedAt).toBe("2026-10-26T09:10:00.000Z");

    const domainTwo = summary.personal.domains.find(
      (domain) => domain.domainId === "output-evaluation-validation",
    );

    expect(domainTwo?.attemptedQuestions).toBe(15);
    expect(domainTwo?.uniqueAttemptedItems).toBe(15);
    expect(domainTwo?.uniqueAnsweredItems).toBe(1);
    expect(domainTwo?.incorrectAnswers).toBe(1);
    expect(domainTwo?.unansweredQuestions).toBe(14);
    expect(domainTwo?.accuracyOnAnswered).toBe(0);
    expect(domainTwo?.lessonId).toBe("evaluation-basics");
    expect(domainTwo?.practiceSetId).toBe("domain-2-output-validation-set");

    const firstObjective = summary.personal.objectives.find(
      (objective) => objective.objectiveId === "output-evaluate-accuracy",
    );
    expect(firstObjective?.bankItemCount).toBe(2);
    expect(firstObjective?.practicedItemCount).toBe(2);
    expect(firstObjective?.answeredItemCount).toBe(1);
    expect(firstObjective?.latestCorrectCount).toBe(0);
    expect(firstObjective?.latestIncorrectCount).toBe(1);
    expect(firstObjective?.signal).toBe("needs-review");

    const unansweredObjective = summary.personal.objectives.find(
      (objective) => objective.objectiveId === "output-fact-check",
    );
    expect(unansweredObjective?.practicedItemCount).toBe(2);
    expect(unansweredObjective?.answeredItemCount).toBe(0);
    expect(unansweredObjective?.signal).toBe("unanswered-only");

    expect(summary.review.unresolved).toBe(15);
    expect(summary.review.studyUnresolved).toBe(15);
    expect(summary.review.timedUnresolved).toBe(0);
    expect(summary.review.resolved).toBe(0);
  });

  it("distinguishes first-seen accuracy, latest accuracy, and cumulative accuracy across repeat attempts", () => {
    const q1 = domainTwoQuestions[0]!.id; // output-accuracy-review-plan
    const q2 = domainTwoQuestions[1]!.id; // output-accurate-but-incomplete

    // Attempt 1: q1 wrong, q2 unanswered
    const attempt1 = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "attempt-1",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      incorrectQuestionIds: [q1],
    });
    // Attempt 2: q1 right, q2 right
    const attempt2 = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "attempt-2",
      startedAt: "2026-10-26T10:00:00.000Z",
      submittedAt: "2026-10-26T10:10:00.000Z",
      correctQuestionIds: [q1, q2],
    });

    let state = upsertStudyAttempt(emptyStudyState, attempt1);
    state = upsertStudyAttempt(state, attempt2);

    const summary = deriveProgressSummary(
      state,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );

    // First-seen: q1 was wrong on attempt 1; q2 was unanswered on attempt 1 so its first-seen answered is attempt 2 (correct)
    // Therefore first-seen answered = 2 (q1 wrong, q2 right) -> 1/2 = 50%
    expect(summary.personal.firstSeen.status).toBe("available");
    expect(summary.personal.firstSeen.correct).toBe(1);
    expect(summary.personal.firstSeen.answered).toBe(2);
    expect(summary.personal.firstSeen.percentage).toBe(50);

    // Latest: both q1 and q2 were answered right on attempt 2 -> 2/2 = 100%
    expect(summary.personal.latest.status).toBe("available");
    expect(summary.personal.latest.correct).toBe(2);
    expect(summary.personal.latest.answered).toBe(2);
    expect(summary.personal.latest.percentage).toBe(100);

    // Cumulative: 3 total answered responses across both attempts (1 wrong + 2 right) -> 2/3 = 66.67%
    expect(summary.personal.cumulative.status).toBe("available");
    expect(summary.personal.cumulative.correct).toBe(2);
    expect(summary.personal.cumulative.answered).toBe(3);
    expect(summary.personal.cumulative.percentage).toBe(66.67);

    // Objective `output-evaluate-accuracy` now has 2/2 bank items correct on latest
    const accuracyObjective = summary.personal.objectives.find(
      (objective) => objective.objectiveId === "output-evaluate-accuracy",
    )!;
    expect(accuracyObjective.latestCorrectCount).toBe(2);
    expect(accuracyObjective.bankItemCount).toBe(2);
    expect(accuracyObjective.signal).toBe("all-bank-items-correct");
    expect(accuracyObjective.signalLabel).toContain("limited bank depth");
  });

  it("reports first-seen and latest accuracy as order-unavailable if identical timestamps have conflicting outcomes", () => {
    const q1 = domainTwoQuestions[0]!.id;

    const attemptA = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "attempt-a",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      incorrectQuestionIds: [q1],
    });
    const attemptB = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "attempt-b",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      correctQuestionIds: [q1],
    });

    let state = upsertStudyAttempt(emptyStudyState, attemptA);
    state = upsertStudyAttempt(state, attemptB);

    const summary = deriveProgressSummary(
      state,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );

    expect(summary.personal.firstSeen.status).toBe("order-unavailable");
    expect(summary.personal.firstSeen.percentage).toBeUndefined();
    expect(summary.personal.latest.status).toBe("order-unavailable");
    expect(summary.personal.latest.percentage).toBeUndefined();
    // Cumulative accuracy remains well-defined regardless of timestamp tie
    expect(summary.personal.cumulative.status).toBe("available");
    expect(summary.personal.cumulative.percentage).toBe(50);
  });

  it("integrates submitted timed-exam results read-only, ignores in-progress timed exams, and prevents duplicate attempts", () => {
    const questionIds = selectTimedExamQuestionIds("timed-seed-1");
    let timedSession = createTimedExamSession({
      sessionId: "timed-session-1",
      assessmentId: timedExamAssessmentId,
      blueprintId: timedExamBlueprintId,
      questionIds,
      policy: timedExamPolicy,
      durationMinutes: timedExamDurationMinutes,
      startedAt: "2026-10-27T12:00:00.000Z",
    });

    // 1. In-progress timed session must NOT be included in Progress or Review
    expect(isSubmittedTimedExamSession(timedSession)).toBe(false);

    const inProgressSummary = deriveProgressSummary(
      emptyStudyState,
      questionBankEntries,
      primaryBlueprint,
      questionById,
      timedSession,
    );
    expect(inProgressSummary.personal.submittedAttempts).toBe(0);
    expect(inProgressSummary.review.unresolved).toBe(0);

    // 2. Answer 1 right (and flag it), 1 wrong, leave 58 unanswered, then submit via expiry
    const timedQuestions = questionIds.map((id) => questionById.get(id)!);
    const timedContext = createTimedExamContext(timedSession, timedQuestions);
    const firstQuestion = timedQuestions[0]!;
    const secondQuestion = timedQuestions[1]!;
    const secondWrongChoice = secondQuestion.choices.find(
      (choice) => !secondQuestion.correctChoiceIds.includes(choice.id),
    )!;

    timedSession = chooseTimedExamAnswer(
      timedContext,
      timedSession,
      firstQuestion.id,
      firstQuestion.correctChoiceIds,
      "2026-10-27T12:05:00.000Z",
    ).session;
    timedSession = toggleTimedExamFlag(
      timedContext,
      timedSession,
      firstQuestion.id,
      "2026-10-27T12:05:10.000Z",
    ).session;
    timedSession = chooseTimedExamAnswer(
      timedContext,
      timedSession,
      secondQuestion.id,
      [secondWrongChoice.id],
      "2026-10-27T12:06:00.000Z",
    ).session;

    const expired = expireTimedExam(
      timedContext,
      timedSession,
      "2026-10-27T14:00:00.000Z",
    ).session;

    expect(isSubmittedTimedExamSession(expired)).toBe(true);
    expect(expired.submissionReason).toBe("time-expired");

    const submittedSummary = deriveProgressSummary(
      emptyStudyState,
      questionBankEntries,
      primaryBlueprint,
      questionById,
      expired,
    );

    expect(submittedSummary.personal.submittedAttempts).toBe(1);
    expect(submittedSummary.personal.studySubmittedAttempts).toBe(0);
    expect(submittedSummary.personal.timedSubmittedAttempts).toBe(1);
    expect(submittedSummary.personal.uniqueItemsAttempted).toBe(60);
    expect(submittedSummary.personal.uniqueItemsAnswered).toBe(2);
    expect(submittedSummary.personal.correctAnswers).toBe(1);
    expect(submittedSummary.personal.incorrectAnswers).toBe(1);
    expect(submittedSummary.personal.unansweredQuestions).toBe(58);
    expect(submittedSummary.personal.attemptHistory).toHaveLength(1);
    expect(submittedSummary.personal.attemptHistory[0]?.source).toBe("timed-mock-exam");
    expect(submittedSummary.personal.attemptHistory[0]?.submissionReason).toBe("time-expired");
    expect(submittedSummary.personal.attemptHistory[0]?.flaggedQuestions).toBe(1);

    // All 60 questions should appear in aggregated review: 1 correct-but-flagged + 1 incorrect + 58 unanswered = 60
    const reviewItems = deriveAggregatedReviewItems(
      emptyStudyState,
      questionById,
      questionBankEntries,
      primaryBlueprint,
      expired,
    );
    expect(reviewItems).toHaveLength(60);
    expect(submittedSummary.review.unresolved).toBe(60);
    expect(submittedSummary.review.timedUnresolved).toBe(60);
    expect(submittedSummary.review.studyUnresolved).toBe(0);

    const flaggedReview = reviewItems.find((item) => item.question.id === firstQuestion.id)!;
    expect(flaggedReview.reasons).toEqual(["flagged"]);
    expect(flaggedReview.storageKey).toBe("cfl.timed-exam.v1");
    expect(flaggedReview.resolvableInStudyStore).toBe(false);
    expect(flaggedReview.domainCode).toBeDefined();
    expect(flaggedReview.objectiveStatement).toBeDefined();
    expect(flaggedReview.lessonId).toBeDefined();

    // 3. Deduplication: if a study attempt has the same session id, do not count or list it twice
    const duplicateStudyAttempt = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "timed-session-1",
      startedAt: "2026-10-27T12:00:00.000Z",
      submittedAt: "2026-10-27T12:30:00.000Z",
    });
    const stateWithSameId = upsertStudyAttempt(emptyStudyState, duplicateStudyAttempt);
    const dedupedSummary = deriveProgressSummary(
      stateWithSameId,
      questionBankEntries,
      primaryBlueprint,
      questionById,
      expired,
    );

    expect(dedupedSummary.personal.submittedAttempts).toBe(1);
    expect(dedupedSummary.personal.studySubmittedAttempts).toBe(1);
    expect(dedupedSummary.personal.timedSubmittedAttempts).toBe(0);
  });

  it("derives per-attempt domain and objective breakdowns with remediation links", () => {
    const questionIds = selectTimedExamQuestionIds("breakdown-seed");
    const timedSession = createTimedExamSession({
      sessionId: "breakdown-session",
      assessmentId: timedExamAssessmentId,
      blueprintId: timedExamBlueprintId,
      questionIds,
      policy: timedExamPolicy,
      durationMinutes: timedExamDurationMinutes,
      startedAt: "2026-10-27T12:00:00.000Z",
    });
    const timedQuestions = questionIds.map((id) => questionById.get(id)!);
    const timedContext = createTimedExamContext(timedSession, timedQuestions);
    const submitted = submitTimedExam(
      timedContext,
      timedSession,
      "2026-10-27T13:00:00.000Z",
    ).session;

    const domainBreakdown = deriveAttemptDomainBreakdown(
      submitted.finalResult!,
      questionBankEntries,
      primaryBlueprint,
    );
    expect(domainBreakdown).toHaveLength(7);
    expect(
      domainBreakdown.map((row) => row.totalQuestions),
    ).toEqual([8, 13, 7, 10, 7, 9, 6]);
    expect(
      domainBreakdown.every((row) => row.lessonId !== undefined && row.practiceSetId !== undefined),
    ).toBe(true);

    const d2Submitted = submitAssessment(
      domainTwoContext,
      startAssessment(domainTwoContext, {
        sessionId: "d2-breakdown",
        startedAt: "2026-10-27T09:00:00.000Z",
      }),
      "2026-10-27T09:05:00.000Z",
    );
    const objectiveBreakdown = deriveAttemptObjectiveBreakdown(
      d2Submitted.result,
      questionBankEntries,
      primaryBlueprint,
    );
    expect(objectiveBreakdown).toHaveLength(6);
    expect(
      objectiveBreakdown.reduce((sum, row) => sum + row.totalQuestions, 0),
    ).toBe(domainTwoQuestions.length);
    expect(
      objectiveBreakdown.every((row) => row.domainCode === "2" && row.lessonId === "evaluation-basics"),
    ).toBe(true);
  });

  it("detects multi-way timestamp ties (3+ attempts where the first two agree and a later tie conflicts) at earliest and latest instants", () => {
    const q1 = domainTwoQuestions[0]!.id;

    // 1. Earliest multi-way tie: attempt-a (correct) and attempt-b (correct) agree by ID sort,
    //    while attempt-c (incorrect) at the exact same earliest timestamp conflicts;
    //    attempt-d (correct) is at a strictly later timestamp so latest order remains unambiguous.
    const earliestA = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "attempt-a",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      correctQuestionIds: [q1],
    });
    const earliestB = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "attempt-b",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      correctQuestionIds: [q1],
    });
    const earliestC = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "attempt-c",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      incorrectQuestionIds: [q1],
    });
    const laterD = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "attempt-d",
      startedAt: "2026-10-26T10:00:00.000Z",
      submittedAt: "2026-10-26T10:10:00.000Z",
      correctQuestionIds: [q1],
    });

    let earliestTieState = upsertStudyAttempt(emptyStudyState, earliestA);
    earliestTieState = upsertStudyAttempt(earliestTieState, earliestB);
    earliestTieState = upsertStudyAttempt(earliestTieState, earliestC);
    earliestTieState = upsertStudyAttempt(earliestTieState, laterD);

    const earliestTieSummary = deriveProgressSummary(
      earliestTieState,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );

    expect(earliestTieSummary.personal.firstSeen.status).toBe("order-unavailable");
    expect(earliestTieSummary.personal.firstSeen.percentage).toBeUndefined();
    expect(earliestTieSummary.personal.latest.status).toBe("available");
    expect(earliestTieSummary.personal.latest.correct).toBe(1);
    expect(earliestTieSummary.personal.latest.answered).toBe(1);
    expect(earliestTieSummary.personal.latest.percentage).toBe(100);

    // 2. Latest multi-way tie: attempt-0 (incorrect) is earliest;
    //    at the latest timestamp, attempt-x (correct) conflicts with attempt-y (incorrect) and attempt-z (incorrect)
    //    where the last two sorted items (attempt-y, attempt-z) agree.
    const earlier0 = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "attempt-0",
      startedAt: "2026-10-26T08:00:00.000Z",
      submittedAt: "2026-10-26T08:10:00.000Z",
      incorrectQuestionIds: [q1],
    });
    const latestX = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "attempt-x",
      startedAt: "2026-10-26T11:00:00.000Z",
      submittedAt: "2026-10-26T11:10:00.000Z",
      correctQuestionIds: [q1],
    });
    const latestY = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "attempt-y",
      startedAt: "2026-10-26T11:00:00.000Z",
      submittedAt: "2026-10-26T11:10:00.000Z",
      incorrectQuestionIds: [q1],
    });
    const latestZ = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "attempt-z",
      startedAt: "2026-10-26T11:00:00.000Z",
      submittedAt: "2026-10-26T11:10:00.000Z",
      incorrectQuestionIds: [q1],
    });

    let latestTieState = upsertStudyAttempt(emptyStudyState, earlier0);
    latestTieState = upsertStudyAttempt(latestTieState, latestX);
    latestTieState = upsertStudyAttempt(latestTieState, latestY);
    latestTieState = upsertStudyAttempt(latestTieState, latestZ);

    const latestTieSummary = deriveProgressSummary(
      latestTieState,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );

    expect(latestTieSummary.personal.firstSeen.status).toBe("available");
    expect(latestTieSummary.personal.firstSeen.correct).toBe(0);
    expect(latestTieSummary.personal.firstSeen.answered).toBe(1);
    expect(latestTieSummary.personal.firstSeen.percentage).toBe(0);
    expect(latestTieSummary.personal.latest.status).toBe("order-unavailable");
    expect(latestTieSummary.personal.latest.percentage).toBeUndefined();
  });

  it("keeps first-seen and latest accuracy available when tied timestamps have agreeing outcomes", () => {
    const q1 = domainTwoQuestions[0]!.id;

    const attemptA = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "agree-a",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      correctQuestionIds: [q1],
    });
    const attemptB = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "agree-b",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      correctQuestionIds: [q1],
    });
    const attemptC = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "agree-c",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      correctQuestionIds: [q1],
    });

    let state = upsertStudyAttempt(emptyStudyState, attemptA);
    state = upsertStudyAttempt(state, attemptB);
    state = upsertStudyAttempt(state, attemptC);

    const summary = deriveProgressSummary(
      state,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );

    expect(summary.personal.firstSeen.status).toBe("available");
    expect(summary.personal.firstSeen.correct).toBe(1);
    expect(summary.personal.firstSeen.answered).toBe(1);
    expect(summary.personal.firstSeen.percentage).toBe(100);
    expect(summary.personal.latest.status).toBe("available");
    expect(summary.personal.latest.correct).toBe(1);
    expect(summary.personal.latest.answered).toBe(1);
    expect(summary.personal.latest.percentage).toBe(100);
  });

  it("compares timestamps by parsed instant across different ISO formats and timezone offsets", () => {
    const q1 = domainTwoQuestions[0]!.id;

    // 1. Equivalent instants in different valid ISO formats with conflicting outcomes -> tie detected!
    //    "2026-10-26T09:10:00Z" === "2026-10-26T09:10:00.000Z" === "2026-10-26T11:10:00.000+02:00"
    const isoA = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "iso-a",
      startedAt: "2026-10-26T09:00:00Z",
      submittedAt: "2026-10-26T09:10:00Z",
      correctQuestionIds: [q1],
    });
    const isoBBase = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "iso-b",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      incorrectQuestionIds: [q1],
    });
    const isoB = {
      ...isoBBase,
      session: {
        ...isoBBase.session,
        startedAt: "2026-10-26T11:00:00.000+02:00",
        submittedAt: "2026-10-26T11:10:00.000+02:00",
      },
    };

    const sameInstantState: StudyState = {
      ...emptyStudyState,
      attempts: [isoA, isoB],
    };

    const sameInstantSummary = deriveProgressSummary(
      sameInstantState,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );
    expect(sameInstantSummary.personal.firstSeen.status).toBe("order-unavailable");
    expect(sameInstantSummary.personal.latest.status).toBe("order-unavailable");

    // 2. Different instants where lexical order disagrees with chronological order:
    //    "2026-10-26T09:10:00Z" is 500ms EARLIER than "2026-10-26T09:10:00.500Z",
    //    even though lexically "2026-10-26T09:10:00.500Z" < "2026-10-26T09:10:00Z" ('.' < 'Z').
    const earlierWithoutMillis = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "no-millis-earlier",
      startedAt: "2026-10-26T09:00:00Z",
      submittedAt: "2026-10-26T09:10:00Z",
      incorrectQuestionIds: [q1],
    });
    const laterWithMillis = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "with-millis-later",
      startedAt: "2026-10-26T09:00:00.500Z",
      submittedAt: "2026-10-26T09:10:00.500Z",
      correctQuestionIds: [q1],
    });

    let millisOrderState = upsertStudyAttempt(emptyStudyState, earlierWithoutMillis);
    millisOrderState = upsertStudyAttempt(millisOrderState, laterWithMillis);

    const millisOrderSummary = deriveProgressSummary(
      millisOrderState,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );

    expect(millisOrderSummary.personal.firstSeen.status).toBe("available");
    expect(millisOrderSummary.personal.firstSeen.percentage).toBe(0);
    expect(millisOrderSummary.personal.latest.status).toBe("available");
    expect(millisOrderSummary.personal.latest.percentage).toBe(100);
    expect(millisOrderSummary.personal.lastSubmittedAt).toBe("2026-10-26T09:10:00.500Z");
    expect(millisOrderSummary.personal.attemptHistory[0]?.attemptId).toBe("with-millis-later");
  });

  it("handles invalid or missing timestamps explicitly without inventing chronological order", () => {
    const q1 = domainTwoQuestions[0]!.id;
    const validAttempt = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "valid-attempt",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      correctQuestionIds: [q1],
    });

    // Mutate cloned state to simulate corrupted/missing historical timestamps in memory
    const invalidSubmittedAttempt = {
      ...validAttempt,
      session: {
        ...validAttempt.session,
        id: "invalid-submitted-at",
        submittedAt: "not-a-valid-timestamp",
      },
    };
    const missingSubmittedAttempt = {
      ...validAttempt,
      session: {
        ...validAttempt.session,
        id: "missing-submitted-at",
        submittedAt: undefined,
      },
    };
    const invalidStartedAttempt = {
      ...validAttempt,
      session: {
        ...validAttempt.session,
        id: "invalid-started-at",
        startedAt: "",
      },
    };

    for (const malformed of [
      invalidSubmittedAttempt,
      missingSubmittedAttempt,
      invalidStartedAttempt,
    ]) {
      const state: StudyState = {
        ...emptyStudyState,
        attempts: [malformed],
      };
      const summary = deriveProgressSummary(
        state,
        questionBankEntries,
        primaryBlueprint,
        questionById,
      );

      expect(summary.personal.submittedAttempts).toBe(1);
      expect(summary.personal.firstSeen.status).toBe("order-unavailable");
      expect(summary.personal.firstSeen.percentage).toBeUndefined();
      expect(summary.personal.latest.status).toBe("order-unavailable");
      expect(summary.personal.latest.percentage).toBeUndefined();
      expect(summary.personal.cumulative.status).toBe("available");
      expect(summary.personal.cumulative.percentage).toBe(100);

      const domainTwo = summary.personal.domains.find(
        (domain) => domain.domainId === "output-evaluation-validation",
      )!;
      expect(domainTwo.firstSeenOrderUnavailable).toBe(true);
      expect(domainTwo.firstSeenAccuracy).toBeUndefined();
      expect(domainTwo.latestOrderUnavailable).toBe(true);
      expect(domainTwo.latestAccuracy).toBeUndefined();

      const objective = summary.personal.objectives.find(
        (obj) => obj.objectiveId === "output-evaluate-accuracy",
      )!;
      expect(objective.signal).toBe("order-unavailable");
      expect(objective.latestOrderUnavailable).toBe(true);
      expect(objective.firstSeenOrderUnavailable).toBe(true);
      expect(objective.latestCorrectCount).toBe(0);
      expect(objective.latestIncorrectCount).toBe(0);
    }
  });

  it("propagates timestamp ambiguity into the affected domain and objective without corrupting unaffected domains", () => {
    const domainOneId = primaryBlueprint.domains[0]!.id;
    const d1Assessment = getPracticeSetForDomain(domainOneId)!.assessment;
    const d1Questions = getAssessmentQuestions(d1Assessment);
    const d1Q1 = d1Questions[0]!.id;
    const d2Q1 = domainTwoQuestions[0]!.id;
    const d2Q2 = domainTwoQuestions[1]!.id;

    // Domain 1 has an unambiguous correct attempt
    const d1Attempt = buildSubmittedStudyAttempt(d1Assessment, {
      sessionId: "d1-clean",
      startedAt: "2026-10-26T08:00:00.000Z",
      submittedAt: "2026-10-26T08:10:00.000Z",
      correctQuestionIds: [d1Q1],
    });

    // Domain 2 has a tied conflicting outcome on d2Q1, plus an unambiguous correct answer on d2Q2
    const d2TieA = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "d2-tie-a",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      correctQuestionIds: [d2Q1, d2Q2],
    });
    const d2TieB = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "d2-tie-b",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      incorrectQuestionIds: [d2Q1],
      correctQuestionIds: [d2Q2],
    });

    let state = upsertStudyAttempt(emptyStudyState, d1Attempt);
    state = upsertStudyAttempt(state, d2TieA);
    state = upsertStudyAttempt(state, d2TieB);

    const summary = deriveProgressSummary(
      state,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );

    // Affected Domain 2 must NOT report a misleading 100% from d2Q2 alone
    const domainTwo = summary.personal.domains.find(
      (domain) => domain.domainId === "output-evaluation-validation",
    )!;
    expect(domainTwo.firstSeenOrderUnavailable).toBe(true);
    expect(domainTwo.firstSeenAccuracy).toBeUndefined();
    expect(domainTwo.firstSeenCorrectAnswers).toBe(0);
    expect(domainTwo.firstSeenAnsweredItems).toBe(0);
    expect(domainTwo.latestOrderUnavailable).toBe(true);
    expect(domainTwo.latestAccuracy).toBeUndefined();
    expect(domainTwo.latestCorrectAnswers).toBe(0);
    expect(domainTwo.latestAnsweredItems).toBe(0);
    // Cumulative accuracy on Domain 2 remains available (3/4 = 75%)
    expect(domainTwo.accuracyOnAnswered).toBe(75);

    // Affected Objective in Domain 2 (`output-evaluate-accuracy`) must be `order-unavailable`, NOT `needs-review`
    const affectedObjective = summary.personal.objectives.find(
      (obj) => obj.objectiveId === "output-evaluate-accuracy",
    )!;
    expect(affectedObjective.signal).toBe("order-unavailable");
    expect(affectedObjective.latestOrderUnavailable).toBe(true);
    expect(affectedObjective.firstSeenOrderUnavailable).toBe(true);
    expect(affectedObjective.latestCorrectCount).toBe(0);
    expect(affectedObjective.latestIncorrectCount).toBe(0);
    expect(affectedObjective.signalLabel).toContain("Latest order unavailable");

    // Unaffected Domain 1 retains its valid first-seen and latest accuracy
    const domainOne = summary.personal.domains.find(
      (domain) => domain.domainId === domainOneId,
    )!;
    expect(domainOne.firstSeenOrderUnavailable).toBe(false);
    expect(domainOne.firstSeenAccuracy).toBe(100);
    expect(domainOne.latestOrderUnavailable).toBe(false);
    expect(domainOne.latestAccuracy).toBe(100);
  });

  it("counts repeatMissCount strictly from incorrect answers and tracks unansweredAttemptCount separately", () => {
    const qIncorrectTwice = domainTwoQuestions[0]!.id;
    const qUnansweredTwice = domainTwoQuestions[1]!.id;
    const qUnansweredThenFlaggedCorrect = domainTwoQuestions[2]!.id;
    const qAlwaysCorrectFlagged = domainTwoQuestions[3]!.id;
    const otherQuestions = domainTwoQuestions
      .slice(4)
      .map((question) => question.id);

    // Attempt 1:
    // - qIncorrectTwice: incorrect
    // - qUnansweredTwice: unanswered
    // - qUnansweredThenFlaggedCorrect: unanswered
    // - qAlwaysCorrectFlagged: correct + flagged
    const attempt1 = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "miss-count-1",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:10:00.000Z",
      incorrectQuestionIds: [qIncorrectTwice],
      correctQuestionIds: [qAlwaysCorrectFlagged, ...otherQuestions],
      flaggedQuestionIds: [qAlwaysCorrectFlagged],
    });

    // Attempt 2:
    // - qIncorrectTwice: incorrect
    // - qUnansweredTwice: unanswered
    // - qUnansweredThenFlaggedCorrect: correct + flagged
    // - qAlwaysCorrectFlagged: correct + flagged
    const attempt2 = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "miss-count-2",
      startedAt: "2026-10-26T10:00:00.000Z",
      submittedAt: "2026-10-26T10:10:00.000Z",
      incorrectQuestionIds: [qIncorrectTwice],
      correctQuestionIds: [
        qUnansweredThenFlaggedCorrect,
        qAlwaysCorrectFlagged,
        ...otherQuestions,
      ],
      flaggedQuestionIds: [qUnansweredThenFlaggedCorrect, qAlwaysCorrectFlagged],
    });

    let state = upsertStudyAttempt(emptyStudyState, attempt1);
    state = upsertStudyAttempt(state, attempt2);

    const reviewItems = deriveAggregatedReviewItems(
      state,
      questionById,
      questionBankEntries,
      primaryBlueprint,
    );

    const itemIncorrect = reviewItems.find(
      (item) =>
        item.attemptId === "miss-count-2" && item.question.id === qIncorrectTwice,
    )!;
    expect(itemIncorrect.reasons).toEqual(["incorrect"]);
    expect(itemIncorrect.repeatMissCount).toBe(2);
    expect(itemIncorrect.unansweredAttemptCount).toBe(0);

    const itemUnanswered = reviewItems.find(
      (item) =>
        item.attemptId === "miss-count-2" && item.question.id === qUnansweredTwice,
    )!;
    expect(itemUnanswered.reasons).toEqual(["unanswered"]);
    expect(itemUnanswered.repeatMissCount).toBe(0);
    expect(itemUnanswered.unansweredAttemptCount).toBe(2);

    const itemUnansweredThenFlagged = reviewItems.find(
      (item) =>
        item.attemptId === "miss-count-2" &&
        item.question.id === qUnansweredThenFlaggedCorrect,
    )!;
    expect(itemUnansweredThenFlagged.reasons).toEqual(["flagged"]);
    expect(itemUnansweredThenFlagged.repeatMissCount).toBe(0);
    expect(itemUnansweredThenFlagged.unansweredAttemptCount).toBe(1);

    const itemAlwaysCorrectFlagged = reviewItems.find(
      (item) =>
        item.attemptId === "miss-count-2" &&
        item.question.id === qAlwaysCorrectFlagged,
    )!;
    expect(itemAlwaysCorrectFlagged.reasons).toEqual(["flagged"]);
    expect(itemAlwaysCorrectFlagged.repeatMissCount).toBe(0);
    expect(itemAlwaysCorrectFlagged.unansweredAttemptCount).toBe(0);
  });

  it("does not let an in-progress study attempt suppress a submitted timed exam, rejects invalid question IDs, and enforces timed-session invariants", () => {
    const questionIds = selectTimedExamQuestionIds("invariant-seed");
    const baseSession = createTimedExamSession({
      sessionId: "shared-session-id",
      assessmentId: timedExamAssessmentId,
      blueprintId: timedExamBlueprintId,
      questionIds,
      policy: timedExamPolicy,
      durationMinutes: timedExamDurationMinutes,
      startedAt: "2026-10-27T12:00:00.000Z",
    });
    const timedQuestions = questionIds.map((id) => questionById.get(id)!);
    const timedContext = createTimedExamContext(baseSession, timedQuestions);
    const submittedTimed = submitTimedExam(
      timedContext,
      baseSession,
      "2026-10-27T13:00:00.000Z",
    ).session;

    // 1. An in-progress study attempt with the exact same ID must NOT suppress `submittedTimed`
    const inProgressDuplicate = createStudyAttempt(
      domainTwoAssessment,
      startAssessment(domainTwoContext, {
        sessionId: "shared-session-id",
        startedAt: "2026-10-27T11:00:00.000Z",
      }),
      {
        kind: "practice",
        practiceSetId: domainTwoAssessment.id,
      },
    );
    const stateWithInProgressDup = upsertStudyAttempt(
      emptyStudyState,
      inProgressDuplicate,
    );

    const summaryWithInProgressDup = deriveProgressSummary(
      stateWithInProgressDup,
      questionBankEntries,
      primaryBlueprint,
      questionById,
      submittedTimed,
    );
    const reviewWithInProgressDup = deriveAggregatedReviewItems(
      stateWithInProgressDup,
      questionById,
      questionBankEntries,
      primaryBlueprint,
      submittedTimed,
    );

    expect(summaryWithInProgressDup.personal.submittedAttempts).toBe(1);
    expect(summaryWithInProgressDup.personal.timedSubmittedAttempts).toBe(1);
    expect(reviewWithInProgressDup).toHaveLength(60);
    expect(summaryWithInProgressDup.review.timedUnresolved).toBe(60);

    // 2. Invalid question IDs in either study attempts or timed sessions are rejected consistently
    const validSubmittedStudy = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "study-with-unknown-q",
      startedAt: "2026-10-27T09:00:00.000Z",
      submittedAt: "2026-10-27T09:10:00.000Z",
    });
    const studyWithInvalidQuestion = {
      ...validSubmittedStudy,
      questionIds: [...validSubmittedStudy.questionIds, "non-existent-question-id"],
    };
    const timedWithInvalidQuestion: TimedExamSession = {
      ...submittedTimed,
      questionIds: ["non-existent-question-id", ...submittedTimed.questionIds.slice(1)],
      finalResult: {
        ...submittedTimed.finalResult!,
        questions: [
          {
            ...submittedTimed.finalResult!.questions[0]!,
            questionId: "non-existent-question-id",
          },
          ...submittedTimed.finalResult!.questions.slice(1),
        ],
      },
    };

    const invalidQuestionState: StudyState = {
      ...emptyStudyState,
      attempts: [studyWithInvalidQuestion],
    };
    const invalidQSummary = deriveProgressSummary(
      invalidQuestionState,
      questionBankEntries,
      primaryBlueprint,
      questionById,
      timedWithInvalidQuestion,
    );
    const invalidQReview = deriveAggregatedReviewItems(
      invalidQuestionState,
      questionById,
      questionBankEntries,
      primaryBlueprint,
      timedWithInvalidQuestion,
    );
    expect(invalidQSummary.personal.submittedAttempts).toBe(0);
    expect(invalidQReview).toEqual([]);

    // 3. Timed-session cross-field invariants
    expect(
      isSubmittedTimedExamSession({
        ...submittedTimed,
        session: { ...submittedTimed.session, id: "mismatched-session-id" },
      }),
    ).toBe(false);
    expect(
      isSubmittedTimedExamSession({
        ...submittedTimed,
        finalResult: {
          ...submittedTimed.finalResult!,
          assessmentId: "mismatched-assessment-id",
        },
      }),
    ).toBe(false);
    expect(
      isSubmittedTimedExamSession({
        ...submittedTimed,
        finalResult: {
          ...submittedTimed.finalResult!,
          submittedAt: "2026-10-27T13:00:01.000Z",
        },
      }),
    ).toBe(false);
    expect(
      isSubmittedTimedExamSession({
        ...submittedTimed,
        finalResult: {
          ...submittedTimed.finalResult!,
          totalQuestions: 59,
        },
      }),
    ).toBe(false);
    expect(
      isSubmittedTimedExamSession({
        ...submittedTimed,
        finalResult: {
          ...submittedTimed.finalResult!,
          correctAnswers: 99,
        },
      }),
    ).toBe(false);
    expect(
      isSubmittedTimedExamSession({
        ...submittedTimed,
        deadlineAt: "2026-10-27T15:00:00.000Z",
      }),
    ).toBe(false);
  });

  it("distinguishes unpracticed vs practiced-but-unanswered items, handles the 4-question objective, partial-bank-correct, and resolved study review items", () => {
    // Domain 2 objective `output-identify-hallucinations` has 5 bank items
    const hallucinationIds = questionBankEntries
      .filter(
        (entry) => entry.examMapping.objectiveIds[0] === "output-identify-hallucinations",
      )
      .map((entry) => entry.question.id);
    expect(hallucinationIds).toHaveLength(5);

    // Subset definition containing only the first 2 of the 5 hallucination items:
    // Answer 1 correct, leave 1 unanswered, and leave the other 3 unpracticed (not in the attempt)
    const subsetDefinition: AssessmentDefinition = {
      id: "hallucination-subset",
      title: "Hallucination subset",
      questionIds: hallucinationIds.slice(0, 2),
      policy: domainTwoAssessment.policy,
    };

    const subsetAttempt = buildSubmittedStudyAttempt(subsetDefinition, {
      sessionId: "hallucination-subset-attempt",
      startedAt: "2026-10-26T09:00:00.000Z",
      submittedAt: "2026-10-26T09:05:00.000Z",
      correctQuestionIds: [hallucinationIds[0]!],
    });

    let state = upsertStudyAttempt(emptyStudyState, subsetAttempt);
    const subsetSummary = deriveProgressSummary(
      state,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );

    const hallucinationObj = subsetSummary.personal.objectives.find(
      (obj) => obj.objectiveId === "output-identify-hallucinations",
    )!;
    expect(hallucinationObj.bankItemCount).toBe(5);
    expect(hallucinationObj.practicedItemCount).toBe(2);
    expect(hallucinationObj.unpracticedItemCount).toBe(3);
    expect(hallucinationObj.answeredItemCount).toBe(1);
    expect(hallucinationObj.unansweredItemCount).toBe(1);
    expect(hallucinationObj.latestCorrectCount).toBe(1);
    expect(hallucinationObj.latestIncorrectCount).toBe(0);
    expect(hallucinationObj.signal).toBe("partial-bank-correct");
    expect(hallucinationObj.signalLabel).toContain(
      "Partially practiced (1/5 bank items correct on latest)",
    );

    // Resolve the 1 unanswered study review item and verify review counts update while timed review stays independent
    expect(subsetSummary.review.unresolved).toBe(1);
    expect(subsetSummary.review.studyUnresolved).toBe(1);
    expect(subsetSummary.review.resolved).toBe(0);

    state = resolveReviewItem(
      state,
      "hallucination-subset-attempt",
      hallucinationIds[1]!,
      "2026-10-26T09:15:00.000Z",
    );

    const resolvedSummary = deriveProgressSummary(
      state,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );
    expect(resolvedSummary.review.unresolved).toBe(0);
    expect(resolvedSummary.review.studyUnresolved).toBe(0);
    expect(resolvedSummary.review.timedUnresolved).toBe(0);
    expect(resolvedSummary.review.resolved).toBe(1);
  });

  it("builds a deduplicated review practice set and resolves only correctly answered study items", () => {
    expect(buildReviewPracticeSet([])).toBeNull();

    const q1 = domainTwoQuestions[0]!;
    const q2 = domainTwoQuestions[1]!;
    const otherIds = domainTwoQuestions.slice(2).map((q) => q.id);

    // Attempt 1 and Attempt 2 both miss q1; Attempt 2 also misses q2
    const attempt1 = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "rev-prac-1",
      startedAt: "2026-10-28T01:00:00.000Z",
      submittedAt: "2026-10-28T01:10:00.000Z",
      incorrectQuestionIds: [q1.id],
      correctQuestionIds: [q2.id, ...otherIds],
    });
    const attempt2 = buildSubmittedStudyAttempt(domainTwoAssessment, {
      sessionId: "rev-prac-2",
      startedAt: "2026-10-28T02:00:00.000Z",
      submittedAt: "2026-10-28T02:10:00.000Z",
      incorrectQuestionIds: [q1.id, q2.id],
      correctQuestionIds: otherIds,
    });

    let state = upsertStudyAttempt(emptyStudyState, attempt1);
    state = upsertStudyAttempt(state, attempt2);

    const openItems = deriveAggregatedReviewItems(
      state,
      questionById,
      questionBankEntries,
      primaryBlueprint,
    );
    // 3 open review items (q1 in attempt 1, q1 in attempt 2, q2 in attempt 2), but only 2 unique questions
    expect(openItems).toHaveLength(3);

    const practiceSet = buildReviewPracticeSet(openItems, "incorrect");
    expect(practiceSet).not.toBeNull();
    expect(practiceSet!.definition.id).toBe("review-open-items-incorrect");
    expect(practiceSet!.definition.title).toBe("Open incorrect review items practice");
    expect(practiceSet!.questions.map((q) => q.id)).toEqual([q1.id, q2.id]);
    expect(practiceSet!.sourceItems).toHaveLength(3);
    expect(practiceSet!.resolvableStudyItems).toHaveLength(3);

    // Simulate answering q1 correctly and q2 incorrectly in the review practice set
    const practiceContext = createAssessmentContext(
      practiceSet!.definition,
      practiceSet!.questions,
    );
    let session = startAssessment(practiceContext, {
      sessionId: "in-memory-review-practice",
      startedAt: "2026-10-28T03:00:00.000Z",
    });
    session = chooseAnswer(practiceContext, session, q1.id, q1.correctChoiceIds);
    const wrongChoiceQ2 = q2.choices.find(
      (choice) => !q2.correctChoiceIds.includes(choice.id),
    )!;
    session = chooseAnswer(practiceContext, session, q2.id, [wrongChoiceQ2.id]);
    const submittedOutcome = submitAssessment(
      practiceContext,
      session,
      "2026-10-28T03:05:00.000Z",
    );

    const correctStudyItems = findCorrectlyAnsweredStudyReviewItems(
      practiceSet!.sourceItems,
      submittedOutcome.result,
    );
    // Both open review items for q1 (from attempt 1 and attempt 2) match the correct answer for q1
    expect(correctStudyItems.map((item) => item.attemptId).sort()).toEqual([
      "rev-prac-1",
      "rev-prac-2",
    ]);
    expect(correctStudyItems.every((item) => item.question.id === q1.id)).toBe(true);
  });
});
