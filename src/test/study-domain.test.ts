import { describe, expect, it } from "vitest";
import {
  StudyStateError,
  assessmentDefinitionSchema,
  calculateAttemptResult,
  chooseAnswer,
  createAssessmentContext,
  createStudyAttempt,
  deriveReviewItems,
  emptyStudyState,
  findActiveAttempt,
  findLatestSubmittedAttempt,
  questionSchema,
  resolveReviewItem,
  startAssessment,
  submitAssessment,
  upsertStudyAttempt,
  type Question,
} from "../domain";

const singleOne: Question = questionSchema.parse({
  id: "study-single-1",
  type: "single-choice",
  stem: "Which option is correct?",
  choices: [
    { id: "a", text: "Correct.", explanation: "Đúng." },
    { id: "b", text: "Wrong.", explanation: "Sai." },
  ],
  correctChoiceIds: ["a"],
  correctExplanation: "Đáp án đúng là A.",
  sourceIds: ["anthropic-prompting-best-practices"],
});

const multiple: Question = questionSchema.parse({
  id: "study-multiple",
  type: "multiple-response",
  stem: "Which options are correct? Select two.",
  choices: [
    { id: "a", text: "Correct one.", explanation: "Đúng." },
    { id: "b", text: "Wrong.", explanation: "Sai." },
    { id: "c", text: "Correct two.", explanation: "Đúng." },
  ],
  correctChoiceIds: ["a", "c"],
  correctExplanation: "Chọn A và C.",
  sourceIds: ["anthropic-prompting-best-practices"],
});

const flagged: Question = questionSchema.parse({
  id: "study-flagged",
  type: "single-choice",
  stem: "Which option should be reviewed?",
  choices: [
    { id: "a", text: "First.", explanation: "Sai." },
    { id: "b", text: "Second.", explanation: "Đúng." },
  ],
  correctChoiceIds: ["b"],
  correctExplanation: "Đáp án đúng là B.",
  sourceIds: ["anthropic-prompting-best-practices"],
});

const questions = [singleOne, multiple, flagged];
const questionById = new Map(questions.map((question) => [question.id, question]));
const definition = assessmentDefinitionSchema.parse({
  id: "study-practice-set",
  title: "Study domain test set",
  questionIds: questions.map((question) => question.id),
  policy: { scoring: "all-or-nothing", allowAnswerChangesBeforeSubmit: true },
});
const context = createAssessmentContext(definition, questions);
const startedAt = "2026-10-26T10:00:00.000Z";
const submittedAt = "2026-10-26T10:15:00.000Z";

function inProgressSession() {
  return startAssessment(context, { sessionId: "attempt-1", startedAt });
}

function submittedAttempt() {
  const session = chooseAnswer(
    context,
    chooseAnswer(context, inProgressSession(), singleOne.id, ["b"]),
    multiple.id,
    ["a"],
  );
  const outcome = submitAssessment(context, session, submittedAt);

  return createStudyAttempt(definition, outcome.session, {
    kind: "practice",
    practiceSetId: definition.id,
  });
}

describe("study attempts", () => {
  it("snapshots question order and finds the active attempt", () => {
    const attempt = createStudyAttempt(definition, inProgressSession(), {
      kind: "practice",
      practiceSetId: definition.id,
    });
    const state = upsertStudyAttempt(emptyStudyState, attempt);

    expect(attempt.questionIds).toEqual(definition.questionIds);
    expect(findActiveAttempt(state, definition.id)?.session.id).toBe("attempt-1");
    expect(findLatestSubmittedAttempt(state, definition.id)).toBeUndefined();
  });

  it("updates in-progress answers but treats submitted attempts as immutable", () => {
    const attempt = createStudyAttempt(definition, inProgressSession(), {
      kind: "practice",
      practiceSetId: definition.id,
    });
    const state = upsertStudyAttempt(emptyStudyState, attempt);
    const changedSession = chooseAnswer(context, attempt.session, singleOne.id, ["a"]);
    const changedAttempt = { ...attempt, session: changedSession };
    const updated = upsertStudyAttempt(state, changedAttempt);

    expect(updated.attempts[0]?.session.answers[singleOne.id]).toEqual(["a"]);

    const submitted = submittedAttempt();
    const submittedState = upsertStudyAttempt(emptyStudyState, submitted);

    expect(upsertStudyAttempt(submittedState, submitted)).toBe(submittedState);
    expect(() =>
      upsertStudyAttempt(submittedState, {
        ...submitted,
        session: { ...submitted.session, answers: {} },
      }),
    ).toThrow(StudyStateError);
  });

  it("scores exact sets and reports unanswered separately", () => {
    const attempt = submittedAttempt();
    const result = calculateAttemptResult(attempt, questionById);

    expect(result.totalQuestions).toBe(3);
    expect(result.correctAnswers).toBe(0);
    expect(result.incorrectAnswers).toBe(2);
    expect(result.unansweredQuestions).toBe(1);
    expect(result.rawPercentage).toBe(0);

    const exact = chooseAnswer(
      context,
      chooseAnswer(
        context,
        chooseAnswer(context, inProgressSession(), singleOne.id, ["a"]),
        multiple.id,
        ["a", "c"],
      ),
      flagged.id,
      ["b"],
    );
    const exactAttempt = createStudyAttempt(
      definition,
      submitAssessment(context, exact, submittedAt).session,
      { kind: "practice", practiceSetId: definition.id },
    );

    expect(calculateAttemptResult(exactAttempt, questionById).correctAnswers).toBe(3);
  });
});

describe("derived review queue", () => {
  it("derives incorrect, unanswered, and flagged items with origins", () => {
    const attempt = submittedAttempt();
    const flaggedSession = {
      ...attempt.session,
      flaggedQuestionIds: [flagged.id],
    };
    const flaggedAttempt = { ...attempt, session: flaggedSession };
    const state = upsertStudyAttempt(emptyStudyState, flaggedAttempt);
    const items = deriveReviewItems(state, questionById);

    expect(items.map((item) => item.question.id).sort()).toEqual([
      singleOne.id,
      multiple.id,
      flagged.id,
    ].sort());

    const byId = new Map(items.map((item) => [item.question.id, item]));

    expect(byId.get(singleOne.id)?.reasons).toEqual(["incorrect"]);
    expect(byId.get(multiple.id)?.reasons).toEqual(["incorrect"]);
    expect(byId.get(flagged.id)?.reasons).toEqual(["unanswered", "flagged"]);
    expect(byId.get(singleOne.id)?.origin).toEqual({
      kind: "practice",
      practiceSetId: definition.id,
    });
    expect(byId.get(singleOne.id)?.submittedAt).toBe(submittedAt);
  });

  it("includes a correct answer when the learner flagged it", () => {
    const exact = chooseAnswer(
      context,
      chooseAnswer(
        context,
        chooseAnswer(context, inProgressSession(), singleOne.id, ["a"]),
        multiple.id,
        ["a", "c"],
      ),
      flagged.id,
      ["b"],
    );
    const flaggedSession = {
      ...exact,
      flaggedQuestionIds: [singleOne.id],
    };
    const attempt = createStudyAttempt(
      definition,
      submitAssessment(context, flaggedSession, submittedAt).session,
      { kind: "practice", practiceSetId: definition.id },
    );
    const state = upsertStudyAttempt(emptyStudyState, attempt);
    const items = deriveReviewItems(state, questionById);

    expect(items).toHaveLength(1);
    expect(items[0]?.question.id).toBe(singleOne.id);
    expect(items[0]?.reasons).toEqual(["flagged"]);
    expect(items[0]?.score.outcome).toBe("correct");
  });

  it("removes an item only after an explicit resolution", () => {
    const attempt = submittedAttempt();
    const state = upsertStudyAttempt(emptyStudyState, attempt);

    expect(deriveReviewItems(state, questionById)).toHaveLength(3);

    const resolved = resolveReviewItem(state, attempt.session.id, singleOne.id, submittedAt);

    expect(deriveReviewItems(resolved, questionById).map((item) => item.question.id)).not.toContain(
      singleOne.id,
    );
    expect(resolveReviewItem(resolved, attempt.session.id, singleOne.id, submittedAt)).toBe(
      resolved,
    );
  });

  it("rejects resolving an in-progress attempt or a question outside it", () => {
    const active = createStudyAttempt(definition, inProgressSession(), {
      kind: "practice",
      practiceSetId: definition.id,
    });
    const activeState = upsertStudyAttempt(emptyStudyState, active);

    expect(() =>
      resolveReviewItem(activeState, active.session.id, singleOne.id, submittedAt),
    ).toThrow(StudyStateError);

    const submitted = submittedAttempt();
    const submittedState = upsertStudyAttempt(emptyStudyState, submitted);

    expect(() =>
      resolveReviewItem(submittedState, submitted.session.id, "unknown-question", submittedAt),
    ).toThrow(StudyStateError);
  });
});
