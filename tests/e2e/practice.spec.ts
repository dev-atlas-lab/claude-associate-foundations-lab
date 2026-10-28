import { expect, test } from "@playwright/test";
import { openRoute } from "./helpers/app";
import {
  choose,
  expectAssessmentStat,
  expectFeedback,
  flagCurrentQuestion,
  goToQuestion,
  questionGroup,
  startAssessment,
  startNewAttempt,
  submitAssessment,
  unflagCurrentQuestion,
} from "./helpers/assessment";
import { getAssessmentQuestions, practiceSets, questionBankEntries } from "./helpers/fixtures";

const practiceSet = practiceSets.find(
  (candidate) => candidate.assessment.id === "domain-7-troubleshooting-set",
)!;
const questions = getAssessmentQuestions(practiceSet.assessment);
const multipleIndex = questions.findIndex(
  (question) => question.type === "multiple-response",
);
const multipleQuestion = questions[multipleIndex]!;
const correctChoices = multipleQuestion.correctChoiceIds;
const wrongChoice = multipleQuestion.choices.find(
  (choice) => !correctChoices.includes(choice.id),
)!;

test.beforeEach(() => {
  expect(practiceSet.questionCount).toBe(questions.length);
  expect(multipleQuestion.type).toBe("multiple-response");
  expect(correctChoices.length).toBeGreaterThan(1);
});

test.describe("practice set selection", () => {
  test("lists registry-derived sets and opens one through the UI", async ({ page }) => {
    await openRoute(page, "/practice");

    await expect(page.getByText(`${practiceSets.length} reviewed sets`, { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        `${practiceSets.length} sets · ${questionBankEntries.length} reviewed items`,
        { exact: true },
      ),
    ).toBeVisible();

    const setLinks = page.getByRole("region", { name: "Reviewed practice sets" }).getByRole("link");
    await expect(setLinks).toHaveCount(practiceSets.length);

    for (const candidate of practiceSets) {
      const link = setLinks.filter({ hasText: candidate.assessment.title }).first();
      await expect(link).toHaveAttribute(
        "href",
        `/practice?set=${encodeURIComponent(candidate.assessment.id)}`,
      );
      await expect(link).toContainText(`${candidate.questionCount} items`);
    }

    await setLinks.filter({ hasText: practiceSet.assessment.title }).first().click();
    await expect(page.getByRole("heading", { name: "Practice questions" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: practiceSet.assessment.title, level: 2 }).first(),
    ).toBeVisible();
    await expect(page.getByText(`${practiceSet.questionCount} questions`, { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start assessment" })).toBeVisible();
    await expect(page.getByText("Not official", { exact: true })).toBeVisible();
  });

  test("opens a set from its ?set= deep link and survives reload", async ({ page }) => {
    await openRoute(page, `/practice?set=${encodeURIComponent(practiceSet.assessment.id)}`);

    await expect(page.getByRole("button", { name: "Start assessment" })).toBeVisible();
    await expect(page.getByText(/questions are in English/i)).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: "Start assessment" })).toBeVisible();
  });

  test("shows a recoverable error for an unknown practice set", async ({ page }) => {
    await openRoute(page, "/practice?set=not-a-real-set");

    await expect(page.getByRole("heading", { name: "That practice set was not found" })).toBeVisible();
    await expect(page.getByText("Unknown set", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start assessment" })).toHaveCount(0);

    await page.getByRole("link", { name: "Back to practice sets" }).click();
    await expect(page.getByRole("heading", { name: "Practice questions" })).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Reviewed practice sets" }).getByRole("link"),
    ).toHaveCount(practiceSets.length);
  });
});

test.describe("question interaction", () => {
  test("changes an answer, flags a question, and keeps answers while navigating", async ({
    page,
  }) => {
    const [first, second] = [questions[0]!, questions[1]!];
    const firstChoice = first.choices[0]!;
    const secondChoice = first.choices[1]!;

    await openRoute(page, `/practice?set=${encodeURIComponent(practiceSet.assessment.id)}`);
    await startAssessment(page);

    await expect(questionGroup(page, first)).toBeVisible();

    const firstRadio = page.getByRole("radio", { name: firstChoice.text, exact: true });
    const secondRadio = page.getByRole("radio", { name: secondChoice.text, exact: true });

    await firstRadio.check();
    await expect(firstRadio).toBeChecked();
    await secondRadio.check();
    await expect(secondRadio).toBeChecked();
    await expect(firstRadio).not.toBeChecked();
    await expect(page.getByText("Answered", { exact: true })).toBeVisible();

    await flagCurrentQuestion(page);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(questionGroup(page, second)).toBeVisible();

    await page.getByRole("button", { name: "Previous" }).click();
    await expect(questionGroup(page, first)).toBeVisible();
    await expect(secondRadio).toBeChecked();
    await unflagCurrentQuestion(page);

    await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();
    await goToQuestion(page, questions.length);
    await expect(questionGroup(page, questions.at(-1)!)).toBeVisible();
    await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  test("requires the exact set for multiple-response scoring", async ({ page }) => {
    await openRoute(page, `/practice?set=${encodeURIComponent(practiceSet.assessment.id)}`);
    await startAssessment(page);

    // A subset of the correct set is not partially correct.
    await goToQuestion(page, multipleIndex + 1);
    await expect(questionGroup(page, multipleQuestion)).toBeVisible();
    await expect(page.getByText("Select all answers that apply.")).toBeVisible();
    await choose(page, multipleQuestion, correctChoices.slice(0, -1));
    await submitAssessment(page);
    await expectFeedback(page, "Chưa đúng");
    await expectAssessmentStat(page, "Sai", 1);
    await expectAssessmentStat(page, "Đúng", 0);

    // A superset of the correct set is also incorrect.
    await startNewAttempt(page);
    await goToQuestion(page, multipleIndex + 1);
    await choose(page, multipleQuestion, [...correctChoices, wrongChoice.id]);
    await submitAssessment(page);
    await expectFeedback(page, "Chưa đúng");
    await expectAssessmentStat(page, "Sai", 1);

    // Exactly the correct set is required.
    await startNewAttempt(page);
    await goToQuestion(page, multipleIndex + 1);
    await choose(page, multipleQuestion, correctChoices);
    await submitAssessment(page);
    await expectFeedback(page, "Chính xác");
    await expectAssessmentStat(page, "Đúng", 1);
    await expectAssessmentStat(page, "Sai", 0);
    await expectAssessmentStat(page, "Chưa trả lời", questions.length - 1);
  });

  test("separates answered-correct, answered-incorrect, and unanswered questions", async ({
    page,
  }) => {
    const first = questions[0]!;
    const second = questions[1]!;

    await openRoute(page, `/practice?set=${encodeURIComponent(practiceSet.assessment.id)}`);
    await startAssessment(page);

    await choose(page, first, first.correctChoiceIds);
    await goToQuestion(page, 2);
    await choose(page, second, [wrongChoice.id]);
    await submitAssessment(page);

    await expectAssessmentStat(page, "Tổng số câu", questions.length);
    await expectAssessmentStat(page, "Đã trả lời", 2);
    await expectAssessmentStat(page, "Đúng", 1);
    await expectAssessmentStat(page, "Sai", 1);
    await expectAssessmentStat(page, "Chưa trả lời", questions.length - 2);
    await expectAssessmentStat(page, "Raw percentage", 25);

    await goToQuestion(page, 1);
    await expectFeedback(page, "Chính xác");
    await goToQuestion(page, 2);
    await expectFeedback(page, "Chưa đúng");

    await expect(questionGroup(page, second).getByRole("checkbox").first()).toBeDisabled();
    await expect(page.getByRole("button", { name: "Submit assessment" })).toHaveCount(0);
    await expect(
      page.getByRole("navigation", { name: "Question navigator" }).getByRole("button"),
    ).toHaveCount(questions.length);
  });

  test("submission requires explicit confirmation and reports unanswered questions", async ({
    page,
  }) => {
    await openRoute(page, `/practice?set=${encodeURIComponent(practiceSet.assessment.id)}`);
    await startAssessment(page);

    await page.getByRole("button", { name: "Submit assessment" }).click();
    await expect(page.getByRole("heading", { name: "Submit this assessment?" })).toBeVisible();
    await expect(
      page.getByText(
        `${questions.length} questions are unanswered and will be marked incorrect.`,
      ),
    ).toBeVisible();

    await page.getByRole("button", { name: "Keep working" }).click();
    await expect(page.getByRole("heading", { name: "Submit this assessment?" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Submit assessment" })).toBeFocused();

    await page.getByRole("button", { name: "Submit assessment" }).click();
    await page.getByRole("button", { name: "Confirm submission" }).click();
    await expect(page.getByRole("heading", { name: "Kết quả luyện tập" })).toBeFocused();
    await expect(page.getByText("Submitted", { exact: false }).first()).toBeVisible();
  });
});
