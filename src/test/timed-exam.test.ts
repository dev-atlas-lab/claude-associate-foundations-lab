import { describe, expect, it } from "vitest";
import {
  AssessmentStateError,
  chooseTimedExamAnswer,
  countTimedExamAnswers,
  createTimedExamContext,
  createTimedExamSession,
  expireTimedExam,
  getTimedExamResult,
  goToTimedExamQuestion,
  isTimedExamExpired,
  questionSchema,
  submitTimedExam,
  timedExamRemainingMs,
  timedExamRemainingSeconds,
  timedExamSessionSchema,
  toggleTimedExamAnswerChoice,
  toggleTimedExamFlag,
  validateTimedExamContent,
  type AssessmentPolicy,
  type Question,
  type TimedExamSession,
} from "../domain";

const policy: AssessmentPolicy = {
  scoring: "all-or-nothing",
  allowAnswerChangesBeforeSubmit: true,
};

const singleQuestion: Question = questionSchema.parse({
  id: "timed-single",
  type: "single-choice",
  stem: "Which response best isolates the failure? Select one.",
  choices: [
    { id: "a", text: "Rewrite the prompt.", explanation: "Không giải quyết nguyên nhân." },
    { id: "b", text: "Reproduce with one variable.", explanation: "Đúng: cô lập biến." },
  ],
  correctChoiceIds: ["b"],
  correctExplanation: "Cô lập một biến giúp xác định nguyên nhân.",
  sourceIds: ["anthropic-prompt-engineering"],
});

const multipleQuestion: Question = questionSchema.parse({
  id: "timed-multiple",
  type: "multiple-response",
  stem: "Which two checks validate the exact answer set? Select two.",
  choices: [
    { id: "x", text: "Compare selected and correct sets.", explanation: "Đúng." },
    { id: "y", text: "Check each missing choice.", explanation: "Đúng." },
    { id: "z", text: "Award partial credit.", explanation: "Sai: không có partial credit." },
  ],
  correctChoiceIds: ["x", "y"],
  correctExplanation: "Exact set, all-or-nothing.",
  sourceIds: ["anthropic-prompt-engineering"],
});

const questions = [singleQuestion, multipleQuestion];

function start(overrides: Partial<Parameters<typeof createTimedExamSession>[0]> = {}) {
  return createTimedExamSession({
    sessionId: "timed-test-1",
    assessmentId: "timed-test",
    blueprintId: "blueprint-test",
    questionIds: questions.map((question) => question.id),
    policy,
    durationMinutes: 120,
    startedAt: "2026-10-28T09:00:00.000Z",
    ...overrides,
  });
}

function contextFor(session: TimedExamSession) {
  return createTimedExamContext(session, questions);
}

function answerEverything(session: TimedExamSession): TimedExamSession {
  const context = contextFor(session);
  const first = toggleTimedExamAnswerChoice(context, session, "timed-single", "b", "2026-10-28T09:10:00.000Z");
  const second = toggleTimedExamAnswerChoice(
    context,
    first.session,
    "timed-multiple",
    "x",
    "2026-10-28T09:11:00.000Z",
  );
  return toggleTimedExamAnswerChoice(
    context,
    second.session,
    "timed-multiple",
    "y",
    "2026-10-28T09:12:00.000Z",
  ).session;
}

describe("timed exam session invariants", () => {
  it("persists an authoritative deadline derived from the start time", () => {
    const session = start();

    expect(session.deadlineAt).toBe("2026-10-28T11:00:00.000Z");
    expect(session.session.startedAt).toBe("2026-10-28T09:00:00.000Z");
    expect(session.session.status).toBe("in-progress");
    expect(timedExamRemainingMs(session, "2026-10-28T09:30:00.000Z")).toBe(90 * 60_000);
    expect(timedExamRemainingSeconds(session, "2026-10-28T09:30:00.000Z")).toBe(5400);
    expect(isTimedExamExpired(session, "2026-10-28T10:59:59.999Z")).toBe(false);
    expect(isTimedExamExpired(session, "2026-10-28T11:00:00.000Z")).toBe(true);
    expect(timedExamRemainingMs(session, "2026-10-29T09:00:00.000Z")).toBe(0);
  });

  it("rejects a tampered deadline and duplicate question ids", () => {
    const session = start();

    expect(
      timedExamSessionSchema.safeParse({
        ...session,
        deadlineAt: "2026-10-28T12:00:00.000Z",
      }).success,
    ).toBe(false);
    expect(() => start({ questionIds: ["timed-single", "timed-single"] })).toThrow(RangeError);
  });

  it("requires a retained result on submitted sessions", () => {
    const session = start();
    const submitted = submitTimedExam(
      contextFor(session),
      session,
      "2026-10-28T10:00:00.000Z",
    ).session;

    expect(submitted.submissionReason).toBe("user");
    expect(submitted.finalResult).toBeDefined();
    expect(
      timedExamSessionSchema.safeParse({
        ...submitted,
        finalResult: undefined,
      }).success,
    ).toBe(false);
    expect(
      timedExamSessionSchema.safeParse({
        ...submitted,
        submissionReason: undefined,
      }).success,
    ).toBe(false);
  });
});

describe("timed exam answer, flag, and navigation flows", () => {
  it("saves answers, exact-set selections, flags, and navigation before submission", () => {
    const session = start();
    const context = contextFor(session);

    const first = toggleTimedExamAnswerChoice(
      context,
      session,
      "timed-single",
      "b",
      "2026-10-28T09:10:00.000Z",
    );
    const flagged = toggleTimedExamFlag(
      context,
      first.session,
      "timed-single",
      "2026-10-28T09:11:00.000Z",
    );
    const navigated = goToTimedExamQuestion(
      context,
      flagged.session,
      1,
      "2026-10-28T09:12:00.000Z",
    );
    const second = toggleTimedExamAnswerChoice(
      context,
      navigated.session,
      "timed-multiple",
      "x",
      "2026-10-28T09:13:00.000Z",
    );
    const third = toggleTimedExamAnswerChoice(
      context,
      second.session,
      "timed-multiple",
      "y",
      "2026-10-28T09:14:00.000Z",
    );

    expect(third.autoSubmitted).toBe(false);
    expect(third.session.session.currentQuestionIndex).toBe(1);
    expect(third.session.session.answers).toEqual({
      "timed-single": ["b"],
      "timed-multiple": ["x", "y"],
    });
    expect(third.session.session.flaggedQuestionIds).toEqual(["timed-single"]);
    expect(countTimedExamAnswers(third.session)).toEqual({
      answered: 2,
      unanswered: 0,
      flagged: 1,
    });
  });

  it("scores exact sets with no partial credit and reports unanswered separately", () => {
    const session = start();
    const context = contextFor(session);
    const subset = toggleTimedExamAnswerChoice(
      context,
      session,
      "timed-multiple",
      "x",
      "2026-10-28T09:10:00.000Z",
    ).session;
    const result = submitTimedExam(
      context,
      subset,
      "2026-10-28T09:20:00.000Z",
    ).session.finalResult;

    expect(result?.questions[1]).toMatchObject({
      outcome: "incorrect",
      isCorrect: false,
    });
    expect(result?.questions[0]).toMatchObject({
      outcome: "unanswered",
      isCorrect: false,
    });
    expect(result?.unansweredQuestions).toBe(1);
    expect(result?.incorrectAnswers).toBe(1);
    expect(result?.correctAnswers).toBe(0);
    expect(result?.rawPercentage).toBe(0);
  });

  it("scores a complete exact set and exposes the retained result", () => {
    const session = answerEverything(start());
    const submitted = submitTimedExam(
      contextFor(session),
      session,
      "2026-10-28T10:00:00.000Z",
    );

    expect(submitted.changed).toBe(true);
    expect(submitted.session.submissionReason).toBe("user");
    expect(submitted.session.session.submittedAt).toBe("2026-10-28T10:00:00.000Z");
    expect(getTimedExamResult(submitted.session)).toMatchObject({
      correctAnswers: 2,
      incorrectAnswers: 0,
      unansweredQuestions: 0,
      answeredQuestions: 2,
      rawPercentage: 100,
    });
  });

  it("locks answers and flags after submission", () => {
    const submitted = submitTimedExam(
      contextFor(start()),
      start(),
      "2026-10-28T10:00:00.000Z",
    ).session;
    const context = contextFor(submitted);

    expect(() =>
      toggleTimedExamAnswerChoice(
        context,
        submitted,
        "timed-single",
        "b",
        "2026-10-28T10:01:00.000Z",
      ),
    ).toThrow(AssessmentStateError);
    expect(() =>
      toggleTimedExamFlag(context, submitted, "timed-single", "2026-10-28T10:01:00.000Z"),
    ).toThrow(expect.objectContaining({ code: "session-not-in-progress" }));
    expect(submitTimedExam(context, submitted, "2026-10-28T10:02:00.000Z")).toEqual({
      session: submitted,
      changed: false,
    });
  });
});

describe("timed exam expiry", () => {
  it("submits automatically at the deadline using the deadline timestamp", () => {
    const session = answerEverything(start());
    const context = contextFor(session);
    const expired = expireTimedExam(context, session, "2026-10-28T11:00:01.000Z");

    expect(expired.autoSubmitted).toBe(true);
    expect(expired.session.session.status).toBe("submitted");
    expect(expired.session.submissionReason).toBe("time-expired");
    expect(expired.session.session.submittedAt).toBe("2026-10-28T11:00:00.000Z");
    expect(expired.session.finalResult?.submittedAt).toBe("2026-10-28T11:00:00.000Z");
    expect(getTimedExamResult(expired.session).correctAnswers).toBe(2);
  });

  it("is idempotent when the expiry event fires more than once", () => {
    const session = start();
    const context = contextFor(session);
    const first = expireTimedExam(context, session, "2026-10-28T11:00:00.000Z");
    const second = expireTimedExam(context, first.session, "2026-10-28T11:05:00.000Z");

    expect(first.autoSubmitted).toBe(true);
    expect(second.autoSubmitted).toBe(false);
    expect(second.session).toBe(first.session);
  });

  it("lets the deadline win over a late user submission", () => {
    const session = start();
    const late = submitTimedExam(
      contextFor(session),
      session,
      "2026-10-28T11:00:05.000Z",
    );

    expect(late.changed).toBe(true);
    expect(late.session.submissionReason).toBe("time-expired");
    expect(late.session.session.submittedAt).toBe("2026-10-28T11:00:00.000Z");
  });

  it("discards an answer or navigation event at the deadline and submits instead", () => {
    const session = start();
    const context = contextFor(session);
    const answer = chooseTimedExamAnswer(
      context,
      session,
      "timed-single",
      ["b"],
      "2026-10-28T11:00:00.000Z",
    );
    const navigation = goToTimedExamQuestion(
      context,
      session,
      1,
      "2026-10-28T11:00:00.000Z",
    );

    expect(answer.autoSubmitted).toBe(true);
    expect(answer.session.session.answers).toEqual({});
    expect(answer.session.submissionReason).toBe("time-expired");
    expect(navigation.autoSubmitted).toBe(true);
    expect(navigation.session.session.currentQuestionIndex).toBe(0);
  });

  it("does not treat a submitted exam as expired", () => {
    const submitted = submitTimedExam(
      contextFor(start()),
      start(),
      "2026-10-28T10:00:00.000Z",
    ).session;

    expect(isTimedExamExpired(submitted, "2026-10-28T12:00:00.000Z")).toBe(false);
  });
});

describe("timed exam content validation", () => {
  it("reports missing questions, unknown choices, and result drift", () => {
    const session = answerEverything(start());
    const submitted = submitTimedExam(
      contextFor(session),
      session,
      "2026-10-28T10:00:00.000Z",
    ).session;
    const missing = validateTimedExamContent(
      submitted,
      new Map([["timed-single", singleQuestion]]),
    );

    expect(missing.map((issue) => issue.code)).toContain("missing-question");
    expect(missing.some((issue) => issue.questionId === "timed-multiple")).toBe(true);

    const unknownChoice = timedExamSessionSchema.parse({
      ...start(),
      session: {
        ...start().session,
        answers: { "timed-single": ["no-such-choice"] },
      },
    });

    expect(
      validateTimedExamContent(
        unknownChoice,
        new Map(questions.map((question) => [question.id, question])),
      ),
    ).toEqual([
      expect.objectContaining({
        code: "unknown-choice",
        questionId: "timed-single",
      }),
    ]);

    const drifted = timedExamSessionSchema.parse({
      ...submitted,
      session: {
        ...submitted.session,
        answers: { ...submitted.session.answers, "timed-single": ["a"] },
      },
    });

    expect(
      validateTimedExamContent(
        drifted,
        new Map(questions.map((question) => [question.id, question])),
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid-result",
          questionId: "timed-single",
        }),
      ]),
    );
  });
});
