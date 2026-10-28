import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { openRoute, STUDY_STORAGE_KEY } from "./helpers/app";
import { expectNoViolations } from "./helpers/a11y";
import {
  TIMED_EXAM_STORAGE_KEY,
  answerCurrentCorrectly,
  currentTimedQuestion,
  openTimedExam,
  readTimedExamEnvelope,
  readTimedExamRaw,
  startTimedExam,
  submitTimedExamEarly,
} from "./helpers/timed";

const examStart = new Date("2026-10-28T09:00:00.000Z");

function resultStat(page: Page, label: string) {
  return page
    .locator(".assessment-stats .stat")
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator("dd");
}

test.describe("timed mock exam", () => {
  test("the untimed preview links to a distinct timed simulation", async ({ page }) => {
    await openRoute(page, "/mock-exam");

    await expect(page.getByText("This is a preview, not a timed simulation")).toBeVisible();
    await expect(page.getByRole("timer")).toHaveCount(0);

    const timedEntry = page.getByRole("region", { name: "Timed simulation" });
    await expect(timedEntry).toContainText("The preview above is untimed");
    await expect(timedEntry).toContainText("saves the authoritative deadline");
    await expect(timedEntry.getByRole("link", { name: "Open timed exam" })).toHaveAttribute(
      "href",
      "/mock-exam/timed",
    );

    await timedEntry.getByRole("link", { name: "Open timed exam" }).click();

    await expect(
      page.getByRole("heading", { level: 1, name: "Timed mock exam" }),
    ).toBeVisible();
    await expect(page.getByText("60 questions", { exact: true })).toBeVisible();
    await expect(page.getByText("120 minutes", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start timed exam" })).toBeEnabled();
    await expect(page.getByRole("timer")).toHaveCount(0);

    const table = page.getByRole("table", {
      name: "Timed exam allocation by official domain",
    });
    await expect(table.getByRole("row")).toHaveCount(8);
  });

  test("answers, flags, and navigation survive a reload under the original deadline", async ({
    page,
  }) => {
    await page.clock.install({ time: examStart });
    await openTimedExam(page);
    await startTimedExam(page);

    await expect(page.getByRole("timer")).toHaveText(/^(2:00:00|1:59:\d{2})$/);
    await answerCurrentCorrectly(page);

    const firstEnvelope = await readTimedExamEnvelope(page);
    const firstQuestionId = firstEnvelope.session.questionIds[0]!;
    expect(firstEnvelope.session.session.answers[firstQuestionId]).toBeDefined();

    await page.getByRole("button", { name: "Flag question" }).click();
    await expect(
      page.getByRole("navigation", { name: "Timed exam question navigator" }).getByRole(
        "button",
        { name: /^Question 1, answered, flagged/ },
      ),
    ).toBeVisible();

    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Question 2 of 60")).toBeVisible();

    await page.clock.fastForward(60_000);
    await expect(page.getByRole("timer")).toHaveText(/^1:5[89]:\d{2}$/);

    const beforeReload = await readTimedExamEnvelope(page);

    await page.reload();

    await expect(page.getByText("Question 2 of 60")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Timed exam question navigator" }).getByRole(
        "button",
        { name: /^Question 2, unanswered, current$/ },
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Timed exam question navigator" }).getByRole(
        "button",
        { name: /^Question 1, answered, flagged$/ },
      ),
    ).toBeVisible();
    await expect(page.getByRole("timer")).not.toHaveText("2:00:00");

    const afterReload = await readTimedExamEnvelope(page);
    expect(afterReload.session.deadlineAt).toBe(beforeReload.session.deadlineAt);
    expect(afterReload.session.session.startedAt).toBe(beforeReload.session.session.startedAt);
    expect(afterReload.session.questionIds).toEqual(beforeReload.session.questionIds);
    expect(afterReload.session.session.answers).toEqual(beforeReload.session.session.answers);
    expect(afterReload.session.session.flaggedQuestionIds).toEqual(
      beforeReload.session.session.flaggedQuestionIds,
    );
    expect(afterReload.session.session.currentQuestionIndex).toBe(1);

    await page
      .getByRole("navigation", { name: "Timed exam question navigator" })
      .getByRole("button", { name: /^Question 1, answered/ })
      .click();
    await expect(page.getByText("Question 1 of 60")).toBeVisible();
    await expect(
      page.locator(".timed-question input").first(),
    ).toBeChecked();
  });

  test("early submission retains one immutable raw result and a review", async ({ page }) => {
    await page.clock.install({ time: examStart });
    await openTimedExam(page);
    await startTimedExam(page);

    const firstQuestion = await currentTimedQuestion(page);
    await answerCurrentCorrectly(page);
    await submitTimedExamEarly(page);

    const resultHeading = page.getByRole("heading", { name: "Kết quả bài thi thử" });
    await expect(resultHeading).toBeFocused();
    await expect(page.getByText("Manual submission")).toBeVisible();
    await expect(resultStat(page, "Tổng số câu")).toHaveText("60");
    await expect(resultStat(page, "Đã trả lời")).toHaveText("1");
    await expect(resultStat(page, "Đúng")).toHaveText("1");
    await expect(resultStat(page, "Chưa trả lời")).toHaveText("59");
    await expect(page.getByText("1.67%").first()).toBeVisible();
    await expect(page.getByText(/không phải dự đoán đậu\/rớt/i)).toBeVisible();

    const submitted = await readTimedExamEnvelope(page);
    expect(submitted.session.submissionReason).toBe("user");
    expect(submitted.session.session.status).toBe("submitted");
    expect(submitted.session.finalResult?.correctAnswers).toBe(1);
    const rawAfterSubmit = await readTimedExamRaw(page);

    await page.reload();
    await expect(resultHeading).toBeVisible();
    await expect(page.getByText("Manual submission")).toBeVisible();
    await expect(resultStat(page, "Đúng")).toHaveText("1");
    expect(await readTimedExamRaw(page)).toBe(rawAfterSubmit);

    const reviewNav = page.getByRole("navigation", {
      name: "Timed exam question navigator",
    });
    await reviewNav.getByRole("button", { name: /^Question 2,/ }).click();

    const inputs = page.locator(".timed-question input");
    await expect(inputs.first()).toBeVisible();
    expect(
      await inputs.evaluateAll((elements) =>
        elements.every((element) => (element as HTMLInputElement).disabled),
      ),
    ).toBe(true);

    await reviewNav.getByRole("button", { name: /^Question 1,/ }).click();
    await expect(page.getByText(firstQuestion.stem, { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Nguồn tham chiếu" })).toBeVisible();
    await expect(page.locator(".timed-source-list a").first()).toHaveAttribute("href", /^https:\/\//);

    expect(await readTimedExamRaw(page)).toBe(rawAfterSubmit);

    await page.getByRole("button", { name: "Start a new timed exam" }).click();
    const confirmation = page.getByRole("heading", { name: "Start a new timed exam?" });
    await expect(confirmation).toBeFocused();
    await page.getByRole("button", { name: "Discard result and continue" }).click();

    await expect(page.getByRole("button", { name: "Start timed exam" })).toBeEnabled();
    expect(await readTimedExamRaw(page)).toBeNull();
  });

  test("auto-submits at the persisted deadline and stays immutable", async ({ page }) => {
    await page.clock.install({ time: examStart });
    await openTimedExam(page);
    await startTimedExam(page);
    await answerCurrentCorrectly(page);

    const started = await readTimedExamEnvelope(page);

    await page.clock.fastForward(7_200_000);

    await expect(page.getByRole("heading", { name: "Kết quả bài thi thử" })).toBeVisible();
    await expect(page.getByText("Automatic expiry")).toBeVisible();
    await expect(page.getByText(/Hết giờ — bài được nộp tự động/)).toBeVisible();
    await expect(resultStat(page, "Đã trả lời")).toHaveText("1");
    await expect(resultStat(page, "Chưa trả lời")).toHaveText("59");

    const expired = await readTimedExamEnvelope(page);
    expect(expired.session.submissionReason).toBe("time-expired");
    expect(expired.session.session.status).toBe("submitted");
    expect(expired.session.session.submittedAt).toBe(started.session.deadlineAt);
    expect(expired.session.finalResult?.submittedAt).toBe(started.session.deadlineAt);
    expect(expired.session.finalResult?.totalQuestions).toBe(60);
    const rawAtExpiry = await readTimedExamRaw(page);

    await page.clock.fastForward(1_800_000);
    await page.reload();

    await expect(page.getByRole("heading", { name: "Kết quả bài thi thử" })).toBeVisible();
    await expect(page.getByText("Automatic expiry")).toBeVisible();
    expect(await readTimedExamRaw(page)).toBe(rawAtExpiry);

    await page
      .getByRole("navigation", { name: "Timed exam question navigator" })
      .getByRole("button", { name: /^Question 2,/ })
      .click();
    expect(await readTimedExamRaw(page)).toBe(rawAtExpiry);
  });

  test("quarantines corrupt data, supports backup download, and discards explicitly", async ({
    page,
  }) => {
    const malformed = "{ not valid timed-exam json";

    await page.addInitScript(
      ([timedKey, studyKey, value]) => {
        if (!sessionStorage.getItem("e2e-timed-seeded")) {
          localStorage.setItem(timedKey, value);
          localStorage.setItem(studyKey, "keep-study-data");
          sessionStorage.setItem("e2e-timed-seeded", "1");
        }
      },
      [TIMED_EXAM_STORAGE_KEY, STUDY_STORAGE_KEY, malformed] as const,
    );

    await openTimedExam(page);

    const recovery = page.getByRole("region", {
      name: "Saved timed exam needs attention",
    });
    await expect(recovery).toBeVisible();
    await expect(page.getByText("Saved timed-exam data is not valid JSON.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start timed exam" })).toHaveCount(0);
    expect(await readTimedExamRaw(page)).toBe(malformed);

    const downloadPromise = page.waitForEvent("download");
    await recovery.getByRole("button", { name: "Download raw backup" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^cfl-timed-exam-backup-.*\.json$/);
    const path = await download.path();
    expect(path).not.toBeNull();
    expect(readFileSync(path!, "utf8")).toBe(malformed);

    await recovery.getByRole("button", { name: "Discard saved timed exam" }).click();
    await expect(
      page.getByRole("button", { name: "Confirm discard timed exam" }),
    ).toBeFocused();
    await recovery.getByRole("button", { name: "Cancel" }).click();
    expect(await readTimedExamRaw(page)).toBe(malformed);

    await recovery.getByRole("button", { name: "Discard saved timed exam" }).click();
    await recovery.getByRole("button", { name: "Confirm discard timed exam" }).click();

    await expect(page.getByRole("button", { name: "Start timed exam" })).toBeEnabled();
    expect(await readTimedExamRaw(page)).toBeNull();
    expect(await page.evaluate((key) => localStorage.getItem(key), STUDY_STORAGE_KEY)).toBe(
      "keep-study-data",
    );
  });

  test("blocks an unsupported schema version without deleting it", async ({ page }) => {
    const incompatible = JSON.stringify({
      schemaVersion: 9,
      contentFingerprint: "old::timed-exam",
    });

    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [TIMED_EXAM_STORAGE_KEY, incompatible] as const,
    );

    await openTimedExam(page);

    await expect(page.getByText(/schema version 9/i)).toBeVisible();
    await expect(page.getByText("Stored schema")).toBeVisible();
    await expect(page.getByText("old::timed-exam")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start timed exam" })).toHaveCount(0);
    expect(await readTimedExamRaw(page)).toBe(incompatible);

    await page.reload();
    await expect(page.getByText(/schema version 9/i)).toBeVisible();
    expect(await readTimedExamRaw(page)).toBe(incompatible);
  });

  test("blocked storage keeps the timed exam usable in memory only", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() {
          throw new DOMException("Storage access is blocked.", "SecurityError");
        },
      });
    });

    await openTimedExam(page);

    await expect(page.getByRole("alert")).toContainText(
      "This browser did not expose localStorage.",
    );
    await startTimedExam(page);
    await expect(page.getByRole("alert")).toContainText("will not be restored after a reload");

    await page.reload();
    await expect(page.getByRole("button", { name: "Start timed exam" })).toBeEnabled();
    await expect(page.getByText("Question 1 of 60")).toHaveCount(0);
  });

  test("a quota write failure is reported while the attempt continues in memory", async ({
    page,
  }) => {
    await page.addInitScript((key) => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function setItem(storageKey: string, value: string) {
        if (storageKey === key) {
          throw new DOMException("The quota is full.", "QuotaExceededError");
        }

        return originalSetItem.call(this, storageKey, value);
      };
    }, TIMED_EXAM_STORAGE_KEY);

    await openTimedExam(page);
    await startTimedExam(page);

    await expect(page.getByRole("alert")).toContainText("Browser storage is full");
    await expect(page.getByText("Question 1 of 60")).toBeVisible();
    expect(await readTimedExamRaw(page)).toBeNull();

    await page.reload();
    await expect(page.getByRole("button", { name: "Start timed exam" })).toBeEnabled();
  });

  test("keyboard use works and timer warnings are not announced every second", async ({
    page,
  }) => {
    await page.clock.install({ time: examStart });
    await openTimedExam(page);
    await startTimedExam(page);

    const timer = page.getByRole("timer");
    await expect(timer).toHaveAttribute("aria-live", "off");
    await expect(timer).toHaveText(/^(2:00:00|1:59:\d{2})$/);

    const firstInput = page.locator(".timed-question input").first();
    await firstInput.focus();
    await page.keyboard.press("Space");
    await expect(firstInput).toBeChecked();

    const next = page.getByRole("button", { name: "Next" });
    await next.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Question 2 of 60")).toBeVisible();

    const liveRegion = page.locator(".timed-session [role='status']");
    await expect(liveRegion).toHaveText("");

    await page.clock.fastForward(6_600_000);

    await expect(page.getByText("Time is running low")).toBeVisible();
    await expect(liveRegion).toHaveText("10 minutes remaining.");

    await page.clock.fastForward(60_000);

    await expect(liveRegion).toHaveText("10 minutes remaining.");
    await expectNoViolations(page, "timed exam warning state");
  });
});
