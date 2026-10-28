import { expect, test } from "@playwright/test";
import {
  elementStatCard,
  escapeRegExp,
  openRoute,
} from "./helpers/app";
import {
  choose,
  expectAssessmentStat,
  flagCurrentQuestion,
  goToQuestion,
  startAssessment,
  submitAssessment,
} from "./helpers/assessment";
import {
  getAssessmentQuestions,
  mockExamSummary,
  practiceSets,
  primaryBlueprint,
  publishedLessons,
  questionBankEntries,
} from "./helpers/fixtures";

const practiceSet = practiceSets.find(
  (candidate) => candidate.assessment.id === "domain-7-troubleshooting-set",
)!;
const questions = getAssessmentQuestions(practiceSet.assessment);
const unansweredCount = questions.length - 2;
const openReviewCount = questions.length;
const expectedRawPercentage = Math.round((1 / questions.length) * 10000) / 100;
const objectiveTotal = primaryBlueprint.domains.reduce(
  (total, domain) => total + domain.objectives.length,
  0,
);

async function seedSubmittedAttempt(page: Parameters<typeof openRoute>[0]) {
  const [first, second] = [questions[0]!, questions[1]!];
  const wrongChoice = second.choices.find(
    (choice) => !second.correctChoiceIds.includes(choice.id),
  )!;

  await openRoute(page, `/practice?set=${encodeURIComponent(practiceSet.assessment.id)}`);
  await startAssessment(page);
  await choose(page, first, first.correctChoiceIds);
  await flagCurrentQuestion(page);
  await goToQuestion(page, 2);
  await choose(page, second, [wrongChoice.id]);
  await submitAssessment(page);

  await expectAssessmentStat(page, "Đúng", 1);
  await expectAssessmentStat(page, "Sai", 1);
  await expectAssessmentStat(page, "Chưa trả lời", questions.length - 2);
}

test.describe("review queue", () => {
  test("derives incorrect, unanswered, and correct-but-flagged items and persists resolution", async ({
    page,
  }) => {
    await seedSubmittedAttempt(page);
    await openRoute(page, "/review");

    await expect(page.getByText(`${openReviewCount} open items`, { exact: true })).toBeVisible();
    await expect(page.getByText("0 resolved", { exact: true })).toBeVisible();
    await expect(page.getByText(`${openReviewCount} shown`, { exact: true })).toBeVisible();

    const filters = page.getByRole("navigation", { name: "Review reason filters" });
    await expect(filters.getByRole("link", { name: /^All/ })).toContainText(String(openReviewCount));
    await expect(filters.getByRole("link", { name: /^Incorrect/ })).toContainText("1");
    await expect(filters.getByRole("link", { name: /^Unanswered/ })).toContainText(
      String(unansweredCount),
    );
    await expect(filters.getByRole("link", { name: /^Flagged/ })).toContainText("1");

    const queue = page.getByRole("list", { name: "Open review items" });
    await expect(queue.getByRole("listitem")).toHaveCount(questions.length);

    const correctFlaggedItem = queue
      .getByRole("link", { name: new RegExp(escapeRegExp(questions[0]!.stem)) })
      .first();
    await expect(correctFlaggedItem).toContainText("Correct, flagged");
    await correctFlaggedItem.click();

    await expect(page.getByRole("heading", { level: 2, name: questions[0]!.stem })).toBeVisible();
    await expect(page.getByText("Correct, flagged", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("article").getByText("Flagged", { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText("Correct answer", { exact: false }).first()).toBeVisible();

    await page.getByRole("button", { name: "Mark reviewed" }).click();

    await expect(
      page.getByRole("heading", { name: "Marked reviewed. This item left the queue." }),
    ).toBeFocused();
    await expect(page.getByRole("button", { name: "Mark reviewed" })).toHaveCount(0);

    await page.getByRole("link", { name: "Back to review queue" }).click();
    await expect(page.getByText(`${openReviewCount - 1} shown`, { exact: true })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Review reason filters" }).getByRole("link", {
        name: /^Flagged/,
      }),
    ).toContainText("0");

    await page
      .getByRole("navigation", { name: "Review reason filters" })
      .getByRole("link", { name: /^Flagged/ })
      .click();
    await expect(page.getByRole("heading", { name: "No items match this filter" })).toBeVisible();

    await page.getByRole("link", { name: "Show all open items" }).click();
    await expect(page.getByText(`${openReviewCount - 1} open items`, { exact: true })).toBeVisible();
    await expect(page.getByText("1 resolved", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Open review items" }).getByRole("listitem"),
    ).toHaveCount(openReviewCount - 1);

    await page.reload();
    await expect(page.getByText(`${openReviewCount - 1} open items`, { exact: true })).toBeVisible();
    await expect(page.getByText("1 resolved", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Open review items" }).getByRole("listitem"),
    ).toHaveCount(openReviewCount - 1);
  });

  test("filtering by a reason keeps the queue derived from the same submitted attempt", async ({
    page,
  }) => {
    await seedSubmittedAttempt(page);
    await openRoute(page, "/review?reason=incorrect");

    await expect(page.getByText("1 shown", { exact: true })).toBeVisible();
    const queue = page.getByRole("list", { name: "Open review items" });
    await expect(queue.getByRole("listitem")).toHaveCount(1);
    await expect(queue.getByRole("link").first()).toContainText(questions[1]!.stem);
    await expect(queue.getByRole("link").first()).toContainText("Incorrect");

    await page.getByRole("navigation", { name: "Review reason filters" }).getByRole("link", {
      name: /^Unanswered/,
    }).click();
    await expect(page.getByText(`${unansweredCount} shown`, { exact: true })).toBeVisible();
    await expect(queue.getByRole("listitem")).toHaveCount(unansweredCount);
  });

  test("zero activity shows an honest empty review queue", async ({ page }) => {
    await openRoute(page, "/review");

    await expect(page.getByText("0 open items", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Nothing to review yet" })).toBeVisible();
    await expect(page.getByText("0 shown", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start a practice set" })).toHaveAttribute(
      "href",
      "/practice",
    );
  });
});

test.describe("progress report", () => {
  test("keeps bank coverage visible while personal performance is empty", async ({ page }) => {
    await openRoute(page, "/progress");

    await expect(page.getByText(`${questionBankEntries.length} reviewed items`, { exact: true })).toBeVisible();
    await expect(page.getByText("No attempts yet", { exact: true })).toBeVisible();

    await expect(elementStatCard(page, "Reviewed items")).toContainText(
      String(questionBankEntries.length),
    );
    await expect(elementStatCard(page, "Objectives covered")).toContainText(
      `${objectiveTotal}/${objectiveTotal}`,
    );
    await expect(elementStatCard(page, "Domains with items")).toContainText(
      `${primaryBlueprint.domains.length}/${primaryBlueprint.domains.length}`,
    );
    await expect(page.getByRole("heading", { name: "No submitted attempts yet" })).toBeVisible();
    await expect(elementStatCard(page, "Open review items")).toContainText("0");
    await expect(elementStatCard(page, "Resolved")).toContainText("0");

    const coverageTable = page.getByRole("table", {
      name: "Reviewed bank coverage by official domain",
    });
    await expect(coverageTable.getByRole("row")).toHaveCount(primaryBlueprint.domains.length + 1);

    let itemsInTable = 0;

    for (const domain of primaryBlueprint.domains) {
      const row = coverageTable.getByRole("row").filter({ hasText: domain.title });
      const cells = row.getByRole("cell");

      itemsInTable += Number((await cells.nth(1).textContent()) ?? 0);

      const objectives = (await cells.nth(2).textContent()) ?? "";
      const [covered, total] = objectives.split("/").map(Number);
      expect(covered, `${domain.title} should cover every objective`).toBe(total);
    }

    expect(itemsInTable).toBe(questionBankEntries.length);
  });

  test("separates coverage from performance and derives review counts", async ({ page }) => {
    await seedSubmittedAttempt(page);
    await openRoute(page, "/progress");

    await expect(page.getByText("1 submitted", { exact: true })).toBeVisible();
    await expect(elementStatCard(page, "Submitted attempts")).toContainText("1");
    await expect(elementStatCard(page, "Submitted attempts")).toContainText(
      `2 answered · ${unansweredCount} unanswered`,
    );
    await expect(elementStatCard(page, "Correct answers")).toContainText("1");
    await expect(elementStatCard(page, "Correct answers")).toContainText("1 incorrect");
    await expect(elementStatCard(page, "Accuracy on answered")).toContainText("50%");
    await expect(elementStatCard(page, "Accuracy on answered")).toContainText(
      `${expectedRawPercentage}%`,
    );
    await expect(elementStatCard(page, "Open review items")).toContainText(String(openReviewCount));
    await expect(elementStatCard(page, "Resolved")).toContainText("0");

    const performanceTable = page.getByRole("table", {
      name: "Personal accuracy by official domain",
    });
    await expect(performanceTable.getByRole("row")).toHaveCount(
      primaryBlueprint.domains.length + 1,
    );

    const domainSeven = primaryBlueprint.domains.find((domain) => domain.code === "7")!;
    const row = performanceTable.getByRole("row").filter({ hasText: domainSeven.title });
    const cells = row.getByRole("cell");

    await expect(cells.nth(0)).toHaveText(String(questions.length));
    await expect(cells.nth(1)).toHaveText("1");
    await expect(cells.nth(2)).toHaveText("1");
    await expect(cells.nth(3)).toHaveText(String(questions.length - 2));
    await expect(cells.nth(4)).toHaveText("50%");
    await expect(page.getByText("These are practice metrics, not a readiness score")).toBeVisible();
  });
});

test.describe("mock exam preview", () => {
  test("shows the registry-derived 60-slot allocation without a timer or shortfall", async ({
    page,
  }) => {
    await openRoute(page, "/mock-exam");

    await expect(
      page.getByText(
        `${mockExamSummary.selectedItemCount}/${mockExamSummary.requestedItemCount} items`,
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText("This is a preview, not a timed simulation", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("No shortfall remains for the verified item count.")).toBeVisible();
    await expect(page.getByText("No timer is applied")).toBeVisible();
    await expect(page.getByText("A timer and official scaled scoring are not implemented.")).toBeVisible();

    const table = page.getByRole("table", {
      name: "Mock exam preview allocation by official domain",
    });
    await expect(table.getByRole("row")).toHaveCount(primaryBlueprint.domains.length + 1);

    const rows = table.locator("tbody tr");
    await expect(rows).toHaveCount(primaryBlueprint.domains.length);

    let available = 0;
    let selected = 0;

    for (const row of await rows.all()) {
      const cells = row.getByRole("cell");
      available += Number((await cells.nth(1).textContent()) ?? 0);
      selected += Number((await cells.nth(2).textContent()) ?? 0);
    }

    expect(available).toBe(questionBankEntries.length);
    expect(selected).toBe(mockExamSummary.selectedItemCount);
    expect(selected).toBe(mockExamSummary.requestedItemCount);

    for (const allocation of mockExamSummary.allocations) {
      const domain = primaryBlueprint.domains.find(
        (candidate) => candidate.id === allocation.domainId,
      )!;
      const row = rows.filter({ hasText: domain.title });
      await expect(row.getByRole("cell").nth(0)).toHaveText(`${allocation.weightPercent}%`);
      await expect(row.getByRole("cell").nth(1)).toHaveText(String(allocation.available));
      await expect(row.getByRole("cell").nth(2)).toHaveText(String(allocation.allocated));
    }

    await page.reload();
    await expect(
      page.getByText(
        `${mockExamSummary.selectedItemCount}/${mockExamSummary.requestedItemCount} items`,
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page.getByText("No shortfall remains for the verified item count.")).toBeVisible();
  });

  test("dashboard counts stay consistent with the registry and submitted activity", async ({
    page,
  }) => {
    await seedSubmittedAttempt(page);
    await openRoute(page, "/");

    await expect(elementStatCard(page, "Lessons available")).toContainText(
      String(publishedLessons.length),
    );
    await expect(elementStatCard(page, "Reviewed bank items")).toContainText(
      String(questionBankEntries.length),
    );
    await expect(elementStatCard(page, "Saved attempts")).toContainText("1");
    await expect(
      page.getByText(`${openReviewCount} open review items`, { exact: false }),
    ).toBeVisible();

    const mock = page.getByRole("region", { name: "Assessment" }).getByRole("link", {
      name: /Mock exam/,
    });
    await expect(mock).toContainText(
      `${mockExamSummary.selectedItemCount} of ${mockExamSummary.requestedItemCount} items`,
    );
  });
});
