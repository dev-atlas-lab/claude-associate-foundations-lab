import { expect, type Locator, type Page } from "@playwright/test";
import type { Question } from "./fixtures";

export function questionGroup(page: Page, question: Question): Locator {
  return page.getByRole("group", { name: question.stem });
}

export function choiceControl(page: Page, question: Question, choiceId: string): Locator {
  const choice = question.choices.find((candidate) => candidate.id === choiceId);

  if (!choice) {
    throw new Error(`question "${question.id}" has no choice "${choiceId}"`);
  }

  return page.getByRole(question.type === "multiple-response" ? "checkbox" : "radio", {
    name: choice.text,
    exact: true,
  });
}

export async function choose(
  page: Page,
  question: Question,
  choiceIds: readonly string[],
): Promise<void> {
  for (const choiceId of choiceIds) {
    await choiceControl(page, question, choiceId).check();
  }
}

export async function startAssessment(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Start assessment" }).click();
  await expect(page.getByRole("button", { name: "Submit assessment" })).toBeVisible();
}

export async function goToQuestion(page: Page, number: number): Promise<void> {
  await page
    .getByRole("navigation", { name: "Question navigator" })
    .getByRole("button", { name: new RegExp(`^Question ${number},`) })
    .click();
  await expect(
    page.getByText(new RegExp(`^Question ${number} of \\d+$`)),
  ).toBeVisible();
}

export async function flagCurrentQuestion(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Flag question" }).click();
  await expect(page.getByRole("button", { name: "Unflag question" })).toBeVisible();
}

export async function unflagCurrentQuestion(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Unflag question" }).click();
  await expect(page.getByRole("button", { name: "Flag question" })).toBeVisible();
}

export async function submitAssessment(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await page.getByRole("button", { name: "Confirm submission" }).click();
  await expect(page.getByRole("heading", { name: "Kết quả luyện tập" })).toBeFocused();
}

export async function startNewAttempt(page: Page): Promise<void> {
  await page.getByRole("button", { name: "New attempt" }).click();
  await expect(page.getByRole("button", { name: "Submit assessment" })).toBeVisible();
}

export async function expectFeedback(page: Page, text: string): Promise<void> {
  await expect(page.getByRole("status").last()).toContainText(text);
}

export async function expectAssessmentStat(
  page: Page,
  label: string,
  value: number,
): Promise<void> {
  const term = page.getByText(label, { exact: true }).first();
  await expect(term.locator("..").locator("dd")).toContainText(String(value));
}

export function currentQuestionCount(page: Page): Promise<string> {
  return page
    .getByText(/^Question \d+ of \d+$/)
    .textContent()
    .then((text) => text ?? "");
}
