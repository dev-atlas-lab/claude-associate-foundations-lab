import { describe, expect, it } from "vitest";
import {
  AssessmentDefinitionError,
  AssessmentStateError,
  assessmentDefinitionSchema,
  calculateAssessmentResult,
  chooseAnswer,
  createAssessmentContext,
  goToNextQuestion,
  goToPreviousQuestion,
  goToQuestion,
  isAnswerCorrect,
  questionSchema,
  startAssessment,
  submitAssessment,
  toggleAnswerChoice,
  toggleQuestionFlag,
  validateAssessmentDefinition,
  type AssessmentDefinition,
  type AssessmentSession,
  type Question,
} from "../domain";

const singleQuestion: Question = questionSchema.parse({
  id: "single-question",
  type: "single-choice",
  stem: "Which action removes stale context? Select one.",
  choices: [
    { id: "a", text: "Raise temperature.", explanation: "Sai: không giảm ngữ cảnh." },
    { id: "b", text: "Retrieve only relevant sections.", explanation: "Đúng: giảm nhiễu." },
    { id: "c", text: "Paste the whole handbook.", explanation: "Sai: tăng nhiễu." },
  ],
  correctChoiceIds: ["b"],
  correctExplanation: "Chọn lọc ngữ cảnh là cách xử lý gốc rễ.",
  sourceIds: ["anthropic-context-windows-doc"],
});

const multipleResponseQuestion: Question = questionSchema.parse({
  id: "multiple-response-question",
  type: "multiple-response",
  stem: "Which actions reduce context noise? Select two.",
  choices: [
    { id: "retrieve", text: "Retrieve only relevant sections.", explanation: "Đúng." },
    { id: "paste", text: "Paste the whole handbook.", explanation: "Sai." },
    { id: "summarize", text: "Summarize older turns.", explanation: "Đúng." },
    { id: "duplicate", text: "Repeat the system prompt.", explanation: "Sai." },
  ],
  correctChoiceIds: ["retrieve", "summarize"],
  correctExplanation: "Hai lựa chọn này giảm nhiễu mà vẫn giữ thông tin cần thiết.",
  sourceIds: ["anthropic-context-windows-doc"],
});

const secondSingleQuestion: Question = questionSchema.parse({
  id: "second-single-question",
  type: "single-choice",
  stem: "Which metric is a practice-only raw percentage? Select one.",
  choices: [
    { id: "scaled", text: "A 100–1,000 scaled score.", explanation: "Sai: đây là điểm chính thức." },
    { id: "raw", text: "Correct answers divided by total questions.", explanation: "Đúng." },
  ],
  correctChoiceIds: ["raw"],
  correctExplanation: "Raw percentage chỉ dùng cho luyện tập.",
  sourceIds: ["anthropic-context-windows-doc"],
});

const definition: AssessmentDefinition = assessmentDefinitionSchema.parse({
  id: "mixed-assessment",
  title: "Mixed assessment",
  questionIds: ["single-question", "multiple-response-question", "second-single-question"],
  policy: {
    scoring: "all-or-nothing",
    allowAnswerChangesBeforeSubmit: true,
  },
});

const context = createAssessmentContext(definition, [
  singleQuestion,
  multipleResponseQuestion,
  secondSingleQuestion,
]);

function start(): AssessmentSession {
  return startAssessment(context, {
    sessionId: "session-1",
    startedAt: "2026-10-26T10:00:00.000Z",
  });
}

function submitAt(session: AssessmentSession, submittedAt = "2026-10-26T10:30:00.000Z") {
  return submitAssessment(context, session, submittedAt);
}

describe("assessment definition validation", () => {
  it("starts with explicit empty state", () => {
    const session = start();

    expect(session).toMatchObject({
      id: "session-1",
      assessmentId: "mixed-assessment",
      status: "in-progress",
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestionIds: [],
      startedAt: "2026-10-26T10:00:00.000Z",
    });
    expect(session.submittedAt).toBeUndefined();
  });

  it("rejects an empty assessment", () => {
    const empty = assessmentDefinitionSchema.parse({
      id: "empty-assessment",
      title: "Empty",
      questionIds: [],
      policy: { scoring: "all-or-nothing", allowAnswerChangesBeforeSubmit: true },
    });

    expect(validateAssessmentDefinition(empty, new Map())).toEqual([
      expect.objectContaining({ code: "empty-assessment" }),
    ]);
    expect(() => createAssessmentContext(empty, [])).toThrow(AssessmentDefinitionError);
  });

  it("reports duplicate question references and missing questions together", () => {
    const broken = assessmentDefinitionSchema.parse({
      id: "broken-assessment",
      title: "Broken",
      questionIds: ["single-question", "single-question", "missing-question"],
      policy: { scoring: "all-or-nothing", allowAnswerChangesBeforeSubmit: true },
    });
    const issues = validateAssessmentDefinition(
      broken,
      new Map([[singleQuestion.id, singleQuestion]]),
    );

    expect(issues.map((issue) => issue.code)).toEqual([
      "duplicate-question-id",
      "missing-question",
    ]);

    expect(() => createAssessmentContext(broken, [singleQuestion])).toThrow(
      /references question "single-question" more than once/,
    );
  });

  it("rejects a session from another assessment", () => {
    const otherDefinition = assessmentDefinitionSchema.parse({
      ...definition,
      id: "other-assessment",
    });
    const otherContext = createAssessmentContext(otherDefinition, [
      singleQuestion,
      multipleResponseQuestion,
      secondSingleQuestion,
    ]);
    const otherSession = startAssessment(otherContext, {
      sessionId: "session-other",
      startedAt: "2026-10-26T10:00:00.000Z",
    });

    expect(() => chooseAnswer(context, otherSession, "single-question", ["b"])).toThrow(
      expect.objectContaining({ code: "wrong-assessment" }),
    );
  });
});

describe("single-choice and multiple-response scoring", () => {
  it("scores a correct single-choice answer and a wrong one", () => {
    const correctSession = chooseAnswer(context, start(), "single-question", ["b"]);
    const correct = submitAt(correctSession).result;
    expect(correct.correctAnswers).toBe(1);
    expect(correct.incorrectAnswers).toBe(0);
    expect(correct.unansweredQuestions).toBe(2);
    expect(correct.rawPercentage).toBe(33.33);
    expect(correct.questions[0]).toMatchObject({
      outcome: "correct",
      isCorrect: true,
      selectedChoiceIds: ["b"],
      correctChoiceIds: ["b"],
    });

    const wrongSession = chooseAnswer(context, start(), "single-question", ["a"]);
    const wrong = submitAt(wrongSession).result;
    expect(wrong.questions[0]).toMatchObject({ outcome: "incorrect", isCorrect: false });
    expect(wrong.correctAnswers).toBe(0);
    expect(wrong.incorrectAnswers).toBe(1);
  });

  it("requires the exact set for multiple-response and gives no partial credit", () => {
    const exact = submitAt(
      chooseAnswer(context, start(), "multiple-response-question", ["retrieve", "summarize"]),
    ).result;
    expect(exact.questions[1]?.outcome).toBe("correct");

    const subset = submitAt(
      chooseAnswer(context, start(), "multiple-response-question", ["retrieve"]),
    ).result;
    expect(subset.questions[1]?.outcome).toBe("incorrect");

    const extra = submitAt(
      chooseAnswer(context, start(), "multiple-response-question", [
        "retrieve",
        "summarize",
        "paste",
      ]),
    ).result;
    expect(extra.questions[1]?.outcome).toBe("incorrect");

    expect(
      isAnswerCorrect(multipleResponseQuestion, ["retrieve", "retrieve"]),
    ).toBe(false);
    expect(isAnswerCorrect(multipleResponseQuestion, [])).toBe(false);
  });

  it("counts missing answers as unanswered and never as correct", () => {
    const result = submitAt(start()).result;

    expect(result).toMatchObject({
      totalQuestions: 3,
      answeredQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      unansweredQuestions: 3,
      rawPercentage: 0,
    });
    expect(result.questions.every((question) => question.outcome === "unanswered")).toBe(true);
  });

  it("scores a mixed set and rounds the raw percentage to two decimals", () => {
    let session = chooseAnswer(context, start(), "single-question", ["b"]);
    session = chooseAnswer(context, session, "multiple-response-question", [
      "retrieve",
      "summarize",
    ]);
    const result = submitAt(session).result;

    expect(result).toMatchObject({
      totalQuestions: 3,
      answeredQuestions: 2,
      correctAnswers: 2,
      incorrectAnswers: 0,
      unansweredQuestions: 1,
      rawPercentage: 66.67,
    });
    expect(result.questions.map((question) => question.outcome)).toEqual([
      "correct",
      "correct",
      "unanswered",
    ]);
  });

  it("requires submission before a result can be calculated", () => {
    expect(() => calculateAssessmentResult(context, start())).toThrow(
      expect.objectContaining({ code: "session-not-submitted" }),
    );
  });
});

describe("answer selection", () => {
  it("rejects invalid and duplicate choice ids", () => {
    expect(() => chooseAnswer(context, start(), "single-question", ["missing"])).toThrow(
      expect.objectContaining({ code: "unknown-choice" }),
    );
    expect(() => chooseAnswer(context, start(), "single-question", ["a", "b"])).toThrow(
      expect.objectContaining({ code: "invalid-selection" }),
    );
    expect(() =>
      chooseAnswer(context, start(), "multiple-response-question", ["retrieve", "retrieve"]),
    ).toThrow(expect.objectContaining({ code: "invalid-selection" }));
    expect(() => chooseAnswer(context, start(), "not-in-assessment", ["a"])).toThrow(
      expect.objectContaining({ code: "unknown-question" }),
    );
  });

  it("changes answers before submission without keeping stale selections", () => {
    let session = chooseAnswer(context, start(), "single-question", ["a"]);
    expect(session.answers["single-question"]).toEqual(["a"]);

    session = chooseAnswer(context, session, "single-question", ["b"]);
    expect(session.answers["single-question"]).toEqual(["b"]);

    session = toggleAnswerChoice(context, session, "multiple-response-question", "retrieve");
    session = toggleAnswerChoice(context, session, "multiple-response-question", "summarize");
    expect(session.answers["multiple-response-question"]).toEqual(["retrieve", "summarize"]);

    session = toggleAnswerChoice(context, session, "multiple-response-question", "retrieve");
    expect(session.answers["multiple-response-question"]).toEqual(["summarize"]);

    session = chooseAnswer(context, session, "multiple-response-question", []);
    expect(session.answers["multiple-response-question"]).toBeUndefined();
  });

  it("honours a policy that disallows changing an existing answer", () => {
    const lockedDefinition = assessmentDefinitionSchema.parse({
      ...definition,
      policy: { scoring: "all-or-nothing", allowAnswerChangesBeforeSubmit: false },
    });
    const lockedContext = createAssessmentContext(lockedDefinition, [
      singleQuestion,
      multipleResponseQuestion,
      secondSingleQuestion,
    ]);
    let session = startAssessment(lockedContext, {
      sessionId: "locked-session",
      startedAt: "2026-10-26T10:00:00.000Z",
    });

    session = chooseAnswer(lockedContext, session, "single-question", ["a"]);
    expect(() => chooseAnswer(lockedContext, session, "single-question", ["b"])).toThrow(
      expect.objectContaining({ code: "answer-changes-not-allowed" }),
    );
    expect(() => chooseAnswer(lockedContext, session, "single-question", ["a"])).not.toThrow();
  });
});

describe("navigation and flags", () => {
  it("navigates within bounds and rejects out-of-range indexes", () => {
    const session = start();

    expect(goToQuestion(context, session, 1).currentQuestionIndex).toBe(1);
    expect(goToQuestion(context, session, 2).currentQuestionIndex).toBe(2);
    expect(() => goToQuestion(context, session, 3)).toThrow(
      expect.objectContaining({ code: "index-out-of-range" }),
    );
    expect(() => goToQuestion(context, session, -1)).toThrow(
      expect.objectContaining({ code: "index-out-of-range" }),
    );

    expect(goToPreviousQuestion(context, session)).toBe(session);
    const last = goToQuestion(context, session, 2);
    expect(goToNextQuestion(context, last)).toBe(last);
    expect(goToNextQuestion(context, session).currentQuestionIndex).toBe(1);
  });

  it("flags and unflags questions", () => {
    let session = toggleQuestionFlag(context, start(), "single-question");
    expect(session.flaggedQuestionIds).toEqual(["single-question"]);

    session = toggleQuestionFlag(context, session, "single-question");
    expect(session.flaggedQuestionIds).toEqual([]);

    session = toggleQuestionFlag(context, session, "multiple-response-question");
    expect(session.flaggedQuestionIds).toEqual(["multiple-response-question"]);

    expect(() => toggleQuestionFlag(context, session, "not-in-assessment")).toThrow(
      expect.objectContaining({ code: "unknown-question" }),
    );
  });
});

describe("submission lifecycle", () => {
  it("prevents answer and flag changes after submission", () => {
    const submitted = submitAt(
      chooseAnswer(context, start(), "single-question", ["b"]),
    ).session;

    expect(() => chooseAnswer(context, submitted, "single-question", ["a"])).toThrow(
      expect.objectContaining({ code: "session-not-in-progress" }),
    );
    expect(() => toggleAnswerChoice(context, submitted, "single-question", "a")).toThrow(
      expect.objectContaining({ code: "session-not-in-progress" }),
    );
    expect(() => toggleQuestionFlag(context, submitted, "single-question")).toThrow(
      expect.objectContaining({ code: "session-not-in-progress" }),
    );
  });

  it("is idempotent when submitted repeatedly", () => {
    const first = submitAt(
      chooseAnswer(context, start(), "single-question", ["b"]),
      "2026-10-26T10:30:00.000Z",
    );
    const second = submitAssessment(context, first.session, "2026-10-26T11:00:00.000Z");
    const third = submitAssessment(context, second.session, "2026-10-26T12:00:00.000Z");

    expect(first.session.status).toBe("submitted");
    expect(first.session.submittedAt).toBe("2026-10-26T10:30:00.000Z");
    expect(second.session).toBe(first.session);
    expect(third.session).toBe(first.session);
    expect(second.result).toEqual(first.result);
    expect(third.result).toEqual(first.result);
    expect(third.result.submittedAt).toBe("2026-10-26T10:30:00.000Z");
    expect(third.result.correctAnswers).toBe(1);
  });

  it("keeps review navigation available after submission", () => {
    const submitted = submitAt(start()).session;
    const atLastQuestion = goToQuestion(context, submitted, 2);
    expect(atLastQuestion.currentQuestionIndex).toBe(2);
    expect(goToPreviousQuestion(context, atLastQuestion).currentQuestionIndex).toBe(1);
  });

  it("exposes a typed state error for invalid lifecycle operations", () => {
    try {
      chooseAnswer(context, submitAt(start()).session, "single-question", ["b"]);
      throw new Error("expected chooseAnswer to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(AssessmentStateError);
      expect((error as AssessmentStateError).code).toBe("session-not-in-progress");
    }
  });
});
