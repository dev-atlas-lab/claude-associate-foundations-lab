import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import {
  openRoute,
  goToNav,
  readStudyEnvelope,
  readStudyRaw,
  STUDY_STORAGE_KEY,
  setTheme,
  writeStudyRaw,
} from "./helpers/app";
import {
  choose,
  expectAssessmentStat,
  goToQuestion,
  questionGroup,
  startAssessment,
  submitAssessment,
} from "./helpers/assessment";
import {
  contentFingerprint,
  getAssessmentQuestions,
  practiceSets,
} from "./helpers/fixtures";

const practiceSet = practiceSets.find(
  (candidate) => candidate.assessment.id === "domain-7-troubleshooting-set",
)!;
const questions = getAssessmentQuestions(practiceSet.assessment);
const practicePath = `/practice?set=${encodeURIComponent(practiceSet.assessment.id)}`;

interface SnapshotEnvelope {
  schemaVersion: number;
  contentFingerprint: string;
  savedAt: string;
  state: {
    attempts: Array<{
      session: {
        id: string;
        assessmentId: string;
        status: string;
        currentQuestionIndex: number;
      };
    }>;
    reviewResolutions: unknown[];
  };
}

async function seedInProgressAttempt(page: Parameters<typeof openRoute>[0]) {
  await openRoute(page, practicePath);
  await startAssessment(page);
  await choose(page, questions[0]!, questions[0]!.correctChoiceIds);
  await goToQuestion(page, 2);
  await expect(questionGroup(page, questions[1]!)).toBeVisible();
}

test.describe("attempt persistence", () => {
  test("an in-progress attempt and its answers survive a reload", async ({ page }) => {
    await seedInProgressAttempt(page);

    const envelope = await readStudyEnvelope<SnapshotEnvelope>(page);
    expect(envelope.schemaVersion).toBe(1);
    expect(envelope.contentFingerprint).toBe(contentFingerprint);
    expect(envelope.savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(envelope.state.attempts).toHaveLength(1);
    expect(envelope.state.attempts[0]!.session.status).toBe("in-progress");
    expect(envelope.state.attempts[0]!.session.currentQuestionIndex).toBe(1);

    await page.reload();

    await expect(questionGroup(page, questions[1]!)).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Question navigator" })
        .getByRole("button", { name: /^Question 1, answered/ }),
    ).toBeVisible();

    await goToQuestion(page, 1);
    await expect(questionGroup(page, questions[0]!)).toBeVisible();
    await expect(
      page.getByRole("radio", {
        name: questions[0]!.choices.find((choice) =>
          questions[0]!.correctChoiceIds.includes(choice.id),
        )!.text,
        exact: true,
      }),
    ).toBeChecked();

    await openRoute(page, "/settings");
    await expect(page.getByText("1 total · 0 submitted · 1 in progress")).toBeVisible();
    await expect(page.getByText(/^ready/)).toBeVisible();
  });

  test("a valid saved envelope can be restored after storage is cleared", async ({ page }) => {
    await seedInProgressAttempt(page);
    const raw = await readStudyRaw(page);

    expect(raw).not.toBeNull();

    await page.evaluate((key) => localStorage.removeItem(key), STUDY_STORAGE_KEY);
    await page.reload();
    await expect(page.getByRole("button", { name: "Start assessment" })).toBeVisible();

    await writeStudyRaw(page, raw!);
    await page.reload();

    await expect(questionGroup(page, questions[1]!)).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Question navigator" })
        .getByRole("button", { name: /^Question 1, answered/ }),
    ).toBeVisible();
  });

  test("malformed JSON is quarantined, backed up, and only reset after confirmation", async ({
    page,
  }) => {
    const malformed = "{ this is not json";
    const rawBackup = malformed;

    await page.addInitScript(
      ([key, value]) => {
        if (!sessionStorage.getItem("e2e-seeded")) {
          localStorage.setItem(key, value);
          sessionStorage.setItem("e2e-seeded", "1");
        }
      },
      [STUDY_STORAGE_KEY, malformed] as const,
    );

    await openRoute(page, practicePath);

    const notice = page.getByRole("alert", { name: "Saved study data needs attention" });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("Saved study data is not valid JSON.");
    await expect(notice).toContainText("New attempts are blocked");
    await expect(page.getByRole("button", { name: "Start assessment" })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await notice.getByRole("button", { name: "Download raw backup" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^cfl-study-backup-.*\.json$/);
    const downloadedPath = await download.path();
    expect(downloadedPath).not.toBeNull();
    expect(readFileSync(downloadedPath!, "utf8")).toBe(rawBackup);

    await notice.getByRole("button", { name: "Reset local data" }).click();
    await expect(page.getByRole("button", { name: "Confirm reset" })).toBeFocused();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    expect(await readStudyRaw(page)).toBe(malformed);

    await page.getByRole("button", { name: "Cancel" }).click();
    expect(await readStudyRaw(page)).toBe(malformed);
    await expect(notice).toBeVisible();

    await notice.getByRole("button", { name: "Reset local data" }).click();
    await page.getByRole("button", { name: "Confirm reset" }).click();

    await expect(notice).toHaveCount(0);
    expect(await readStudyRaw(page)).toBeNull();

    await startAssessment(page);
    await choose(page, questions[0]!, questions[0]!.correctChoiceIds);
    await submitAssessment(page);
    await expectAssessmentStat(page, "Đúng", 1);
    expect(await readStudyRaw(page)).not.toBeNull();
  });

  test("a saved attempt is not silently resumed when its content fingerprint is stale", async ({
    page,
  }) => {
    await openRoute(page, practicePath);
    await startAssessment(page);
    await choose(page, questions[0]!, questions[0]!.correctChoiceIds);
    await submitAssessment(page);
    await expect(page.getByRole("heading", { name: "Kết quả luyện tập" })).toBeVisible();

    const envelope = await readStudyEnvelope<SnapshotEnvelope>(page);
    expect(envelope.state.attempts[0]!.session.status).toBe("submitted");
    const stale = JSON.stringify({
      ...envelope,
      contentFingerprint: `${contentFingerprint}-stale`,
    });

    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [STUDY_STORAGE_KEY, stale] as const,
    );
    await openRoute(page, practicePath);

    const notice = page.getByRole("alert", { name: "Saved study data needs attention" });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(
      "Saved attempts were created with different questions or answer keys",
    );
    await expect(page.getByRole("heading", { name: "Kết quả luyện tập" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Start assessment" })).toBeVisible();

    await openRoute(page, "/progress");
    await expect(page.getByText("No submitted attempts yet")).toBeVisible();
    await expect(page.getByRole("alert", { name: "Saved study data needs attention" })).toBeVisible();
  });

  test("an incompatible schema version blocks writes and explains the mismatch", async ({
    page,
  }) => {
    const incompatible = JSON.stringify({
      schemaVersion: 99,
      contentFingerprint,
      savedAt: new Date().toISOString(),
      state: { attempts: [], reviewResolutions: [] },
    });

    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [STUDY_STORAGE_KEY, incompatible] as const,
    );
    await openRoute(page, practicePath);

    const notice = page.getByRole("alert", { name: "Saved study data needs attention" });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(
      "Saved study data uses schema version 99; this app expects 1.",
    );

    await page.getByRole("button", { name: "Start assessment" }).click();
    await expect(page.getByRole("alert").filter({
      hasText: "Saved study data must be backed up or reset before new attempts can be saved.",
    })).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit assessment" })).toHaveCount(0);
  });

  test("blocked storage keeps the attempt usable in memory and reports the risk", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function setItem(key: string, value: string) {
        if (key === "cfl.study.v1") {
          throw new DOMException("Storage is blocked for this test.", "SecurityError");
        }

        return originalSetItem.call(this, key, value);
      };
    });

    await openRoute(page, practicePath);
    await startAssessment(page);
    await choose(page, questions[0]!, questions[0]!.correctChoiceIds);
    await submitAssessment(page);
    await expectAssessmentStat(page, "Đúng", 1);

    const notice = page.getByRole("status", { name: "Local storage is unavailable" });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("lost on refresh");

    await goToNav(page, "Settings");
    await expect(page.getByText("Storage unavailable", { exact: true })).toBeVisible();
    await expect(page.getByRole("alert")).toContainText(
      "This browser blocked local storage writes.",
    );
    await expect(page.getByText("1 total · 1 submitted · 0 in progress")).toBeVisible();

    await page.reload();
    await openRoute(page, practicePath);
    await expect(page.getByRole("button", { name: "Start assessment" })).toBeVisible();
    expect(await readStudyRaw(page)).toBeNull();
  });

  test("storage that cannot be read falls back to an in-memory session", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() {
          throw new DOMException("Storage access is blocked.", "SecurityError");
        },
      });
    });

    await openRoute(page, practicePath);
    await expect(page.getByRole("status", { name: "Local storage is unavailable" })).toBeVisible();

    await startAssessment(page);
    await choose(page, questions[0]!, questions[0]!.correctChoiceIds);
    await submitAssessment(page);
    await expectAssessmentStat(page, "Đúng", 1);

    await goToNav(page, "Settings");
    await expect(page.getByText("Storage unavailable", { exact: true })).toBeVisible();
    await expect(page.getByText("1 total · 1 submitted · 0 in progress")).toBeVisible();
  });
});

test.describe("settings reset and backup", () => {
  test("exports a restorable backup and keeps the reset behind confirmation", async ({ page }) => {
    await openRoute(page, "/");
    await setTheme(page, "light");
    await seedInProgressAttempt(page);
    await openRoute(page, "/settings");

    await expect(page.getByText("1 total · 0 submitted · 1 in progress")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download study backup" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^cfl-study-\d{4}-\d{2}-\d{2}\.json$/);
    const backupPath = await download.path();
    expect(backupPath).not.toBeNull();

    const backup = JSON.parse(readFileSync(backupPath!, "utf8")) as SnapshotEnvelope;
    expect(backup.schemaVersion).toBe(1);
    expect(backup.contentFingerprint).toBe(contentFingerprint);
    expect(backup.state.attempts).toHaveLength(1);
    expect(backup.state.attempts[0]!.session.status).toBe("in-progress");

    const savedBeforeReset = await readStudyRaw(page);
    expect(savedBeforeReset).not.toBeNull();

    await page.getByRole("button", { name: "Reset study data" }).click();
    await expect(page.getByRole("button", { name: "Confirm reset study data" })).toBeFocused();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("1 total · 0 submitted · 1 in progress")).toBeVisible();
    expect(await readStudyRaw(page)).toBe(savedBeforeReset);

    await page.getByRole("button", { name: "Reset study data" }).click();
    await page.getByRole("button", { name: "Confirm reset study data" }).click();

    await expect(page.getByText("0 total · 0 submitted · 0 in progress")).toBeVisible();
    await expect(
      page.getByText("Study data reset. No attempts or review resolutions remain."),
    ).toBeVisible();
    expect(await readStudyRaw(page)).toBeNull();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await page.evaluate(() => localStorage.getItem("cfl.theme"))).toBe("light");
  });

  test("reset preferences restores the default dark theme", async ({ page }) => {
    await openRoute(page, "/settings");
    await setTheme(page, "light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.getByRole("button", { name: "Reset preferences" }).click();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByText("Preferences reset. The theme is back to Dark.")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("cfl.theme"))).toBe("dark");
  });
});
