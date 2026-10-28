import { expect, type Page } from "@playwright/test";
import { getQuestion } from "./fixtures";
import { openRoute } from "./app";

export const TIMED_EXAM_STORAGE_KEY = "cfl.timed-exam.v1";

export interface TimedExamEnvelope {
  schemaVersion: number;
  contentFingerprint: string;
  savedAt: string;
  session: {
    id: string;
    assessmentId: string;
    blueprintId: string;
    questionIds: string[];
    durationMinutes: number;
    deadlineAt: string;
    submissionReason?: "user" | "time-expired";
    finalResult?: {
      rawPercentage: number;
      correctAnswers: number;
      incorrectAnswers: number;
      unansweredQuestions: number;
      submittedAt: string;
      totalQuestions: number;
      questions: Array<{ questionId: string; outcome: string }>;
    };
    session: {
      id: string;
      status: "in-progress" | "submitted";
      currentQuestionIndex: number;
      answers: Record<string, string[]>;
      flaggedQuestionIds: string[];
      startedAt: string;
      submittedAt?: string;
    };
  };
}

export async function openTimedExam(page: Page): Promise<void> {
  await openRoute(page, "/mock-exam/timed");
}

export async function startTimedExam(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Start timed exam" }).click();
  await expect(page.getByText("Question 1 of 60")).toBeVisible();
  await expect(page.getByRole("timer")).toBeVisible();
}

export async function readTimedExamEnvelope(page: Page): Promise<TimedExamEnvelope> {
  const raw = await page.evaluate(
    (key) => localStorage.getItem(key),
    TIMED_EXAM_STORAGE_KEY,
  );

  expect(raw, "expected a saved timed-exam envelope").not.toBeNull();

  return JSON.parse(raw!) as TimedExamEnvelope;
}

export async function readTimedExamRaw(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), TIMED_EXAM_STORAGE_KEY);
}

export async function currentTimedQuestion(page: Page) {
  const envelope = await readTimedExamEnvelope(page);
  const index = envelope.session.session.currentQuestionIndex;
  const question = getQuestion(envelope.session.questionIds[index]!);

  if (!question) {
    throw new Error(`question at index ${index} is not in the content registry`);
  }

  return question;
}

/** Choose every correct choice for the current question and assert it persisted. */
export async function answerCurrentCorrectly(page: Page): Promise<void> {
  const question = await currentTimedQuestion(page);
  const role = question.type === "multiple-response" ? "checkbox" : "radio";

  for (const choiceId of question.correctChoiceIds) {
    const choice = question.choices.find((candidate) => candidate.id === choiceId);

    if (!choice) {
      throw new Error(`missing choice ${choiceId}`);
    }

    await page.getByRole(role, { name: choice.text, exact: true }).click();
  }

  await expect
    .poll(async () => {
      const envelope = await readTimedExamEnvelope(page);
      return envelope.session.session.answers[question.id] ?? [];
    })
    .toEqual(expect.arrayContaining(question.correctChoiceIds));
}

export async function submitTimedExamEarly(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Submit exam" }).click();
  await expect(
    page.getByRole("heading", { name: "Submit the timed exam?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Submit exam now" }).click();
  await expect(
    page.getByRole("heading", { name: "Kết quả bài thi thử" }),
  ).toBeVisible();
}
