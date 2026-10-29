import { expect, test } from "@playwright/test";
import {
  elementStatCard,
  goToNav,
  openRoute,
} from "./helpers/app";
import { expectNoSkippedHeadingLevels, readHeadings } from "./helpers/a11y";
import {
  getLessonNeighbours,
  getObjective,
  getPracticeSetForDomain,
  getQuestionBankEntry,
  practiceSets,
  primaryBlueprint,
  publishedLessons,
  questionBankEntries,
} from "./helpers/fixtures";
import { mockExamSummary } from "./helpers/fixtures";

const mappedLessons = publishedLessons.filter(
  (lesson) => lesson.examMapping.status !== "unmapped",
);
const sampleLessons = publishedLessons.filter((lesson) => lesson.kind === "sample");
const firstLesson = publishedLessons[0]!;
const lastLesson = publishedLessons.at(-1)!;

test.describe("dashboard and navigation", () => {
  test("dashboard renders registry-derived workspace coverage", async ({ page }) => {
    await openRoute(page, "/");

    await expect(page.getByRole("heading", { name: "Your study desk" })).toBeVisible();

    await expect(elementStatCard(page, "Lessons available")).toContainText(
      String(publishedLessons.length),
    );
    await expect(elementStatCard(page, "Lessons available")).toContainText(
      `${mappedLessons.length} exam-mapped curriculum + ${sampleLessons.length} design sample`,
    );
    await expect(elementStatCard(page, "Reviewed bank items")).toContainText(
      String(questionBankEntries.length),
    );
    await expect(elementStatCard(page, "Saved attempts")).toContainText("0");

    const blueprint = page.getByRole("region", { name: "Exam blueprint" });
    await expect(blueprint).toBeVisible();

    for (const domain of primaryBlueprint.domains) {
      const row = blueprint.locator(".row").filter({ hasText: domain.title });
      await expect(row).toContainText(`${domain.weightPercent}%`);
      await expect(row).toContainText(`${domain.objectives.length} objectives`);
    }

    await expect(page.getByText("No lessons queued")).toBeVisible();
    await expect(page.getByText("All seven exam domains now have a published")).toBeVisible();

    const headings = await readHeadings(page);
    expectNoSkippedHeadingLevels(headings, "dashboard");
  });

  test("learn lists every published lesson and the pending-lesson empty state", async ({ page }) => {
    await openRoute(page, "/learn");

    await expect(page.getByRole("heading", { name: "Learning modules" })).toBeVisible();
    await expect(page.getByText(`${publishedLessons.length} published`, { exact: false })).toBeVisible();
    await expect(page.getByText(`${mappedLessons.length} mapped lessons`, { exact: true })).toBeVisible();
    await expect(page.getByText(`${sampleLessons.length} sample`, { exact: true })).toBeVisible();

    const lessonLinks = page
      .getByRole("region", { name: "Available now" })
      .getByRole("link");

    await expect(lessonLinks).toHaveCount(publishedLessons.length);

    for (const lesson of publishedLessons) {
      await expect(
        lessonLinks.filter({ hasText: lesson.title }).first(),
      ).toHaveAttribute("href", `/learn/${lesson.id}`);
    }

    await expect(page.getByText("No lessons queued")).toBeVisible();
  });

  test("sidebar routes to every primary page", async ({ page }) => {
    await openRoute(page, "/");

    const destinations = [
      ["Learn", "Learning modules"],
      ["Practice", "Practice questions"],
      ["Mock exam", "Mock exam"],
      ["Review", "Review mistakes"],
      ["Progress", "Learning progress"],
      ["Glossary", "Technical glossary"],
      ["Settings", "Preferences"],
      ["Dashboard", "Your study desk"],
    ] as const;

    for (const [navLabel, heading] of destinations) {
      await goToNav(page, navLabel);
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
      await expect(
        page
          .getByRole("navigation", { name: "Sections" })
          .getByRole("link", { name: navLabel, exact: true }),
      ).toHaveAttribute("aria-current", "page");
    }
  });
});

test.describe("lesson learning", () => {
  for (const lesson of publishedLessons) {
    test(`lesson ${lesson.id} renders its mapping, content, sources, and practice links`, async ({
      page,
    }) => {
      await openRoute(page, `/learn/${lesson.id}`);

      await expect(page.getByRole("heading", { level: 1, name: lesson.title })).toBeVisible();
      await expect(page.getByText(lesson.englishTitle, { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Mục tiêu bài học" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Knowledge check" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Tóm tắt" })).toBeVisible();
      await expect(page.getByText(`${lesson.estimatedMinutes} min`).first()).toBeVisible();

      const mappingBadge =
        lesson.examMapping.status === "unmapped" ? "No official objective" : "Exam-mapped";
      await expect(page.getByText(mappingBadge, { exact: true })).toBeVisible();

      const sourceLinks = page.locator("#lesson-summary .source-list").getByRole("link");
      await expect(sourceLinks).toHaveCount(lesson.sourceIds.length);

      for (const link of await sourceLinks.all()) {
        await expect(link).toHaveAttribute("href", /^https:\/\//);
        await expect(link).toHaveAttribute("target", "_blank");
      }

      if (lesson.relatedQuestionIds.length > 0) {
        const relatedHeading = page.getByRole("heading", {
          name: "Câu hỏi luyện tập đã rà soát",
        });
        await expect(relatedHeading).toBeVisible();
        await expect(
          page.getByText(
            `có ${lesson.relatedQuestionIds.length} câu liên kết trực tiếp với bài học này`,
            { exact: false },
          ),
        ).toBeVisible();

        const firstEntry = getQuestionBankEntry(lesson.relatedQuestionIds[0]!);
        const firstObjective = firstEntry
          ? getObjective(firstEntry.examMapping.objectiveIds[0]!)
          : undefined;

        const expectedPracticeSet = firstObjective
          ? getPracticeSetForDomain(firstObjective.domain.id)
          : undefined;
        const expectedPracticeHref = expectedPracticeSet
          ? `/practice?set=${encodeURIComponent(expectedPracticeSet.assessment.id)}`
          : "/practice";

        expect(firstEntry, "related question must resolve in the bank").toBeDefined();
        expect(firstObjective, "related question objective must resolve").toBeDefined();
        await expect(
          page.getByText(firstObjective!.objective.statement, { exact: true }),
        ).toBeVisible();
        await expect(
          page
            .locator("#lesson-related-practice")
            .getByRole("link", { name: /practice/i }),
        ).toHaveAttribute("href", expectedPracticeHref);
      }

      const headings = await readHeadings(page);
      expectNoSkippedHeadingLevels(headings, `lesson ${lesson.id}`);
    });
  }

  test("previous and next lesson navigation walks the append-only order", async ({ page }) => {
    await openRoute(page, `/learn/${firstLesson.id}`);

    for (const lesson of publishedLessons.slice(1)) {
      await page
        .getByRole("navigation", { name: "Lesson navigation" })
        .getByRole("link", { name: /^Next lesson/ })
        .click();
      await expect(page.getByRole("heading", { level: 1, name: lesson.title })).toBeVisible();
    }

    await expect(
      page.getByRole("navigation", { name: "Lesson navigation" }).getByText("End of module"),
    ).toBeVisible();

    for (const lesson of [...publishedLessons].reverse().slice(1)) {
      await page
        .getByRole("navigation", { name: "Lesson navigation" })
        .getByRole("link", { name: /^Previous lesson/ })
        .click();
      await expect(page.getByRole("heading", { level: 1, name: lesson.title })).toBeVisible();
    }

    await expect(
      page.getByRole("navigation", { name: "Lesson navigation" }).getByText(
        "This is the first lesson",
      ),
    ).toBeVisible();
    expect(getLessonNeighbours(firstLesson.id).previous).toBeUndefined();
    expect(getLessonNeighbours(lastLesson.id).next).toBeUndefined();
  });

  test("a lesson deep link survives a hard reload", async ({ page }) => {
    const lesson = publishedLessons.find((candidate) => candidate.id === "workflow-design")!;

    await openRoute(page, `/learn/${lesson.id}`);
    await expect(page.getByRole("heading", { level: 1, name: lesson.title })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: lesson.title })).toBeVisible();
  });

  test("unknown lesson ids render a deliberate not-found state", async ({ page }) => {
    const response = await page.goto("/learn/not-a-real-lesson");

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Lesson not found" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Nothing to read at this address" })).toBeVisible();
    await expect(page.getByText(/No published lesson matches/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to modules" })).toHaveAttribute(
      "href",
      "/learn",
    );
  });

  test("unknown routes render the catch-all not-found page", async ({ page }) => {
    await openRoute(page, "/route-that-does-not-exist");
    await expect(page.getByRole("heading", { name: "This page does not exist" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lost in the lab" })).toBeVisible();
  });

  test("the Context Window sample stays unmapped and is not counted as objective coverage", async ({
    page,
  }) => {
    const sample = publishedLessons.find((lesson) => lesson.id === "context-window")!;

    expect(sample.kind).toBe("sample");
    expect(sample.examMapping.status).toBe("unmapped");
    expect(sample.examMapping.objectiveIds).toEqual([]);

    await openRoute(page, `/learn/${sample.id}`);
    await expect(page.getByText("No official objective", { exact: true })).toBeVisible();
    await expect(page.getByText("Chưa gắn với objective chính thức")).toBeVisible();
    await expect(page.getByText("Sample lesson", { exact: true })).toBeVisible();

    await openRoute(page, "/learn");
    await expect(page.getByText(`${mappedLessons.length} mapped lessons`)).toBeVisible();

    await openRoute(page, "/");
    await expect(elementStatCard(page, "Lessons available")).toContainText(
      `${mappedLessons.length} exam-mapped curriculum + 1 design sample`,
    );
  });

  test("assessment shortcuts describe practice and the 60-slot preview honestly", async ({
    page,
  }) => {
    await openRoute(page, "/");

    const assessmentShortcuts = page.getByRole("region", { name: "Assessment" });

    const practice = assessmentShortcuts.getByRole("link", { name: /Practice questions/ });
    await expect(practice).toHaveAttribute("href", "/practice");
    await expect(practice).toContainText(String(questionBankEntries.length));

    const mock = assessmentShortcuts.getByRole("link", { name: /Mock exam/ });
    await expect(mock).toHaveAttribute("href", "/mock-exam");
    await expect(mock).toContainText(
      `${mockExamSummary.selectedItemCount} of ${mockExamSummary.requestedItemCount} items`,
    );
    await expect(mock).toContainText("no timer");
    await expect(mock).toContainText("no scaled score");
  });

  test("practice shortcut opens the registry-driven practice index", async ({ page }) => {
    await openRoute(page, "/");

    await page.getByRole("link", { name: "Practice questions" }).click();
    await expect(page.getByRole("heading", { name: "Practice questions" })).toBeVisible();
    await expect(page.getByText(`${practiceSets.length} reviewed sets`, { exact: true })).toBeVisible();
  });
});
