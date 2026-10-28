import { describe, expect, it } from "vitest";
import {
  allQuestions,
  getAssessment,
  getAssessmentQuestions,
  primaryBlueprint,
  questionBankEntries,
} from "../content";
import {
  chooseAnswer,
  createAssessmentContext,
  createStudyAttempt,
  emptyStudyState,
  startAssessment,
  submitAssessment,
  upsertStudyAttempt,
} from "../domain";
import { deriveProgressSummary } from "../features/progress/selectors";

const questionById = new Map(allQuestions.map((question) => [question.id, question]));
const assessment = getAssessment("domain-2-output-validation-set")!;
const questions = getAssessmentQuestions(assessment);
const context = createAssessmentContext(assessment, questions);

function submittedState() {
  const firstQuestion = questions[0]!;
  const wrongChoice = firstQuestion.choices.find(
    (choice) => !firstQuestion.correctChoiceIds.includes(choice.id),
  )!;
  const session = chooseAnswer(
    context,
    startAssessment(context, {
      sessionId: "progress-attempt",
      startedAt: "2026-10-26T09:00:00.000Z",
    }),
    firstQuestion.id,
    [wrongChoice.id],
  );
  const submitted = submitAssessment(context, session, "2026-10-26T09:10:00.000Z");
  const attempt = createStudyAttempt(assessment, submitted.session, {
    kind: "practice",
    practiceSetId: assessment.id,
  });

  return upsertStudyAttempt(emptyStudyState, attempt);
}

describe("progress summary", () => {
  it("reports bank coverage independently of personal activity", () => {
    const summary = deriveProgressSummary(
      emptyStudyState,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );

    expect(summary.bank.totalItems).toBe(62);
    expect(summary.bank.singleChoiceItems).toBe(32);
    expect(summary.bank.multipleResponseItems).toBe(30);
    expect(summary.bank.objectivesCovered).toBe(30);
    expect(summary.bank.objectivesTotal).toBe(30);
    expect(summary.bank.domainsWithItems).toBe(7);

    const domainFive = summary.bank.domains.find(
      (domain) => domain.domainId === "configuration-knowledge-management",
    );

    expect(domainFive?.itemCount).toBe(8);
    expect(domainFive?.objectivesCovered).toBe(4);
    expect(summary.bank.domains.every((domain) => domain.itemCount > 0)).toBe(true);
    expect(
      summary.bank.domains.every(
        (domain) => domain.objectivesCovered === domain.objectivesTotal,
      ),
    ).toBe(true);

    expect(summary.personal.submittedAttempts).toBe(0);
    expect(summary.personal.accuracyOnAnswered).toBeUndefined();
    expect(summary.personal.rawPercentage).toBeUndefined();
    expect(summary.review).toEqual({ unresolved: 0, resolved: 0 });
  });

  it("derives personal accuracy and review counts from submitted attempts", () => {
    const state = submittedState();
    const summary = deriveProgressSummary(
      state,
      questionBankEntries,
      primaryBlueprint,
      questionById,
    );

    expect(summary.bank.totalItems).toBe(62);
    expect(summary.personal.submittedAttempts).toBe(1);
    expect(summary.personal.answeredQuestions).toBe(1);
    expect(summary.personal.correctAnswers).toBe(0);
    expect(summary.personal.incorrectAnswers).toBe(1);
    expect(summary.personal.unansweredQuestions).toBe(13);
    expect(summary.personal.accuracyOnAnswered).toBe(0);
    expect(summary.personal.rawPercentage).toBe(0);
    expect(summary.personal.lastSubmittedAt).toBe("2026-10-26T09:10:00.000Z");

    const domainTwo = summary.personal.domains.find(
      (domain) => domain.domainId === "output-evaluation-validation",
    );

    expect(domainTwo?.attemptedQuestions).toBe(14);
    expect(domainTwo?.incorrectAnswers).toBe(1);
    expect(domainTwo?.unansweredQuestions).toBe(13);
    expect(domainTwo?.accuracyOnAnswered).toBe(0);

    expect(summary.review.unresolved).toBe(14);
    expect(summary.review.resolved).toBe(0);
  });
});
