import { expect, test, type Page } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  openRoute,
  setTheme,
  STUDY_STORAGE_KEY,
} from "./helpers/app";
import {
  expectNoSkippedHeadingLevels,
  expectNoViolations,
  readHeadings,
} from "./helpers/a11y";
import {
  choose,
  goToQuestion,
  questionGroup,
  startAssessment,
  submitAssessment,
} from "./helpers/assessment";
import {
  getAssessmentQuestions,
  practiceSets,
  publishedLessons,
} from "./helpers/fixtures";

const themes = ["dark", "light"] as const;
const practiceSet = practiceSets.find(
  (candidate) => candidate.assessment.id === "domain-7-troubleshooting-set",
)!;
const questions = getAssessmentQuestions(practiceSet.assessment);
const practicePath = `/practice?set=${encodeURIComponent(practiceSet.assessment.id)}`;

async function submitEmptyAttempt(page: Page) {
  await openRoute(page, practicePath);
  await startAssessment(page);
  await submitAssessment(page);
}

async function scan(page: Page, label: string) {
  await expectNoHorizontalOverflow(page);
  await expectNoViolations(page, label);
}

for (const theme of themes) {
  test.describe(`${theme} theme accessibility`, () => {
    test.beforeEach(async ({ page }) => {
      await openRoute(page, "/");
      if (theme === "light") {
        await setTheme(page, "light");
      } else {
        await setTheme(page, "dark");
      }
    });

    test("dashboard", async ({ page }) => {
      await openRoute(page, "/");
      await scan(page, `${theme} dashboard`);
    });

    test("learn index", async ({ page }) => {
      await openRoute(page, "/learn");
      await scan(page, `${theme} learn index`);
    });

    for (const lesson of publishedLessons) {
      test(`lesson ${lesson.id}`, async ({ page }) => {
        await openRoute(page, `/learn/${lesson.id}`);
        await scan(page, `${theme} lesson ${lesson.id}`);
      });
    }

    test("practice index and deep link", async ({ page }) => {
      await openRoute(page, "/practice");
      await scan(page, `${theme} practice index`);

      await openRoute(page, practicePath);
      await scan(page, `${theme} practice start screen`);
    });

    test("practice unknown set error", async ({ page }) => {
      await openRoute(page, "/practice?set=not-a-real-set");
      await scan(page, `${theme} unknown practice set`);
    });

    test("assessment question and result states", async ({ page }) => {
      await openRoute(page, practicePath);
      await startAssessment(page);
      await scan(page, `${theme} single-choice question`);

      await goToQuestion(page, 2);
      await expect(questionGroup(page, questions[1]!)).toBeVisible();
      await scan(page, `${theme} multiple-response question`);

      await submitAssessment(page);
      await scan(page, `${theme} submitted result`);
    });

    test("mock exam preview", async ({ page }) => {
      await openRoute(page, "/mock-exam");
      await scan(page, `${theme} mock exam preview`);

      await page.getByRole("button", { name: "Start assessment" }).click();
      await expect(page.getByText("Question 1 of 60")).toBeVisible();
      await scan(page, `${theme} mock exam question`);

      await page.getByRole("button", { name: "Submit assessment" }).click();
      await page.getByRole("button", { name: "Confirm submission" }).click();
      await expect(
        page.getByRole("heading", { name: "Kết quả luyện tập" }),
      ).toBeVisible();
      await scan(page, `${theme} mock exam result`);
    });

    test("empty review and progress states", async ({ page }) => {
      await openRoute(page, "/review");
      await scan(page, `${theme} empty review`);

      await openRoute(page, "/progress");
      await scan(page, `${theme} empty progress`);
    });

    test("populated review queue, detail, and progress", async ({ page }) => {
      await submitEmptyAttempt(page);

      await openRoute(page, "/review");
      await scan(page, `${theme} populated review queue`);

      await page
        .getByRole("list", { name: "Open review items" })
        .getByRole("link")
        .first()
        .click();
      await expect(page.getByRole("button", { name: "Mark reviewed" })).toBeVisible();
      await scan(page, `${theme} review detail`);

      await page.getByRole("button", { name: "Mark reviewed" }).click();
      await expect(
        page.getByRole("heading", { name: "Marked reviewed. This item left the queue." }),
      ).toBeFocused();
      await scan(page, `${theme} review resolved`);

      await openRoute(page, "/progress");
      await scan(page, `${theme} populated progress`);
    });

    test("glossary and no-results state", async ({ page }) => {
      await openRoute(page, "/glossary");
      await scan(page, `${theme} glossary`);

      await page.getByRole("searchbox", { name: "Search terms" }).fill("zzzzzz-no-match");
      await expect(page.getByRole("heading", { name: "No matching terms" })).toBeVisible();
      await scan(page, `${theme} glossary no results`);
    });

    test("settings", async ({ page }) => {
      await openRoute(page, "/settings");
      await scan(page, `${theme} settings`);

      await page.getByRole("button", { name: "Reset study data" }).click();
      await expect(
        page.getByRole("button", { name: "Confirm reset study data" }),
      ).toBeFocused();
      await scan(page, `${theme} settings reset confirmation`);
      await page.getByRole("button", { name: "Cancel" }).click();
      await expect(page.getByRole("button", { name: "Reset study data" })).toBeFocused();
    });

    test("not-found states", async ({ page }) => {
      await openRoute(page, "/learn/not-a-real-lesson");
      await scan(page, `${theme} lesson not found`);

      await openRoute(page, "/route-that-does-not-exist");
      await scan(page, `${theme} route not found`);
    });

    test("corrupt storage recovery notice", async ({ page }) => {
      await page.addInitScript(
        ([key, value]) => {
          if (!sessionStorage.getItem("e2e-a11y-seeded")) {
            localStorage.setItem(key, value);
            sessionStorage.setItem("e2e-a11y-seeded", "1");
          }
        },
        [STUDY_STORAGE_KEY, "{ definitely not json"] as const,
      );

      await openRoute(page, practicePath);
      await expect(
        page.getByRole("alert", { name: "Saved study data needs attention" }),
      ).toBeVisible();
      await scan(page, `${theme} corrupt storage notice`);
    });
  });
}

test.describe("document structure and keyboard access", () => {
  test("every route has one main landmark, one h1, and no skipped heading levels", async ({
    page,
  }) => {
    const routes = [
      "/",
      "/learn",
      ...publishedLessons.map((lesson) => `/learn/${lesson.id}`),
      "/practice",
      practicePath,
      "/practice?set=not-a-real-set",
      "/mock-exam",
      "/review",
      "/progress",
      "/glossary",
      "/settings",
      "/learn/not-a-real-lesson",
      "/route-that-does-not-exist",
    ];

    for (const route of routes) {
      await openRoute(page, route);

      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("navigation", { name: "Sections" })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

      const headings = await readHeadings(page);
      expectNoSkippedHeadingLevels(headings, route);
    }
  });

  test("skip link is the first keyboard stop and moves focus to main", async ({ page }) => {
    await openRoute(page, "/");

    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
    await expect(page).toHaveURL(/#main-content$/);
  });

  test("mobile navigation traps focus, closes with Escape, and returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openRoute(page, "/");

    const toggle = page.getByRole("button", { name: "Open navigation" });
    await expect(toggle).toBeVisible();
    await toggle.click();

    const sidebar = page.getByRole("complementary", { name: "Primary" });
    await expect(sidebar).toBeVisible();
    await expect(page.getByRole("button", { name: "Close navigation" })).toBeFocused();
    await expect(page.locator(".app-main")).toHaveAttribute("inert", "");
    await expectNoViolations(page, "mobile navigation open");

    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("button", { name: "Close navigation" })).not.toBeFocused();

    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
    await expect(page.locator(".app-main")).not.toHaveAttribute("inert", "");
    await expect(page.getByRole("button", { name: "Close navigation" })).toHaveCount(0);
  });

  test("question controls are labelled and answer state is exposed as text", async ({ page }) => {
    await openRoute(page, practicePath);
    await startAssessment(page);

    const first = questions[0]!;
    const group = questionGroup(page, first);
    await expect(group).toBeVisible();
    await expect(group.getByRole("radio")).toHaveCount(first.choices.length);

    const firstRadio = group.getByRole("radio").first();
    await firstRadio.focus();
    await page.keyboard.press("Space");
    await expect(firstRadio).toBeChecked();

    await goToQuestion(page, 2);
    const second = questions[1]!;
    const checkboxes = questionGroup(page, second).getByRole("checkbox");
    await expect(checkboxes).toHaveCount(second.choices.length);
    await expect(checkboxes.first()).not.toBeChecked();

    await choose(page, second, second.correctChoiceIds);
    for (const choice of second.correctChoiceIds) {
      await expect(
        page.getByRole("checkbox", {
          name: second.choices.find((candidate) => candidate.id === choice)!.text,
          exact: true,
        }),
      ).toBeChecked();
    }

    await submitAssessment(page);
    await expect(questionGroup(page, second)).toBeVisible();

    const options = questionGroup(page, second).getByRole("checkbox");

    for (let index = 0; index < second.choices.length; index += 1) {
      const choice = second.choices[index]!;
      const isCorrect = second.correctChoiceIds.includes(choice.id);

      await expect(options.nth(index)).toBeDisabled();

      if (isCorrect) {
        await expect(options.nth(index)).toBeChecked();
        await expect(options.nth(index).locator("..")).toContainText("Correct answer");
      }
    }

    await expect(
      page
        .getByRole("navigation", { name: "Question navigator" })
        .getByRole("button", { name: /^Question 2, correct/ }),
    ).toBeVisible();
  });

  test("moving between questions moves focus to the new question", async ({ page }) => {
    await openRoute(page, practicePath);
    await startAssessment(page);

    await page.getByRole("button", { name: "Next" }).click();
    await expect(questionGroup(page, questions[1]!)).toBeVisible();
    await expect(page.getByText(questions[1]!.stem, { exact: true })).toBeFocused();

    await goToQuestion(page, 1);
    await expect(page.getByText(questions[0]!.stem, { exact: true })).toBeFocused();
  });

  test("lesson knowledge check focuses feedback and restores focus on Try again", async ({
    page,
  }) => {
    await openRoute(page, "/learn/context-window");

    const check = page.getByRole("button", { name: "Check answer" });
    await expect(check).toBeDisabled();

    const firstOption = page.getByRole("radio").first();
    await firstOption.check();
    await check.click();

    await expect(page.getByRole("status").last()).toBeFocused();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();

    await page.getByRole("button", { name: "Try again" }).click();
    await expect(firstOption).toBeFocused();
    await expect(firstOption).not.toBeChecked();
    await expect(check).toBeDisabled();
  });

  test("keyboard activation navigates and route changes focus the main region", async ({
    page,
  }) => {
    await openRoute(page, "/");

    const learn = page
      .getByRole("navigation", { name: "Sections" })
      .getByRole("link", { name: "Learn" });
    await learn.focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/learn$/);
    await expect(page.getByRole("main")).toBeFocused();
    await expect(page.getByRole("heading", { level: 1, name: "Learning modules" })).toBeVisible();
  });

  test("reduced motion removes smooth scrolling and long transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openRoute(page, "/learn/context-window");

    const styles = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const button = document.querySelector("button");
      const buttonStyles = button ? getComputedStyle(button) : undefined;

      return {
        scrollBehavior: root.scrollBehavior,
        transitionDuration: buttonStyles?.transitionDuration,
        animationDuration: buttonStyles?.animationDuration,
      };
    });

    expect(styles.scrollBehavior).toBe("auto");

    const isNegligible = (duration: string | undefined) =>
      duration !== undefined &&
      duration.endsWith("s") &&
      Number.parseFloat(duration) <= 0.00002;

    expect(isNegligible(styles.transitionDuration)).toBe(true);
    expect(isNegligible(styles.animationDuration)).toBe(true);
  });
});
