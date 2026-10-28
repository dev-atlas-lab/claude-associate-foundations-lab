import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, openRoute } from "./helpers/app";
import {
  choose,
  questionGroup,
  startAssessment,
} from "./helpers/assessment";
import { getAssessmentQuestions, practiceSets } from "./helpers/fixtures";
import { TIMED_EXAM_STORAGE_KEY, startTimedExam } from "./helpers/timed";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const practiceSet = practiceSets.find(
  (candidate) => candidate.assessment.id === "domain-7-troubleshooting-set",
)!;
const questions = getAssessmentQuestions(practiceSet.assessment);
const practicePath = `/practice?set=${encodeURIComponent(practiceSet.assessment.id)}`;

const routes = [
  "/",
  "/learn",
  "/learn/workflow-design",
  practicePath,
  "/mock-exam",
  "/mock-exam/timed",
  "/review",
  "/progress",
  "/glossary",
  "/settings",
];

test.describe("responsive layout", () => {
  for (const viewport of viewports) {
    test(`core routes fit ${viewport.name} without horizontal scrolling`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of routes) {
        await openRoute(page, route);
        await expectNoHorizontalOverflow(page);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.getByRole("main")).toBeVisible();
      }
    });

    test(`controls stay inside the ${viewport.name} viewport`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of ["/", "/learn", practicePath, "/mock-exam", "/progress", "/settings"]) {
        await openRoute(page, route);

        const clipped = await page.evaluate(() => {
          const main = document.querySelector("main");

          if (!main) {
            return [];
          }

          return Array.from(main.querySelectorAll<HTMLElement>("button, a, input"))
            .filter((element) => element.offsetParent !== null)
            .map((element) => {
              const rect = element.getBoundingClientRect();

              return {
                label:
                  element.getAttribute("aria-label") ??
                  element.textContent?.trim().slice(0, 40) ??
                  element.tagName,
                left: rect.left,
                right: rect.right,
                width: rect.width,
                height: rect.height,
              };
            })
            .filter(
              (control) =>
                control.width > 0 &&
                control.height > 0 &&
                (control.left < -1 || control.right > window.innerWidth + 1),
            );
        });

        expect(clipped, `${route} has controls outside the viewport`).toEqual([]);
      }
    });
  }

  test("mobile practice runner keeps questions and actions usable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openRoute(page, practicePath);
    await expect(page.getByRole("button", { name: "Start assessment" })).toBeVisible();

    await startAssessment(page);
    await expect(questionGroup(page, questions[0]!)).toBeVisible();
    await choose(page, questions[0]!, questions[0]!.correctChoiceIds);

    const options = questionGroup(page, questions[0]!).getByRole("radio");
    await expect(options).toHaveCount(questions[0]!.choices.length);

    for (let index = 0; index < questions[0]!.choices.length; index += 1) {
      const box = await options.nth(index).locator("..").boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(391);
    }

    for (const button of ["Next", "Submit assessment"]) {
      const control = page.getByRole("button", { name: button });
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(391);
    }

    await page.getByRole("button", { name: "Submit assessment" }).click();
    await expect(page.getByRole("button", { name: "Confirm submission" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("timed exam runner stays usable at every target width", async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/mock-exam/timed");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate((key) => localStorage.removeItem(key), TIMED_EXAM_STORAGE_KEY);
      await page.reload();
      await expect(page.getByRole("button", { name: "Start timed exam" })).toBeVisible();

      await startTimedExam(page);
      await expectNoHorizontalOverflow(page);
      await expect(page.getByRole("timer")).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Timed exam question navigator" }),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Submit exam" })).toBeVisible();

      const clipped = await page.evaluate(() => {
        const main = document.querySelector("main");

        if (!main) {
          return [];
        }

        return Array.from(main.querySelectorAll<HTMLElement>("button, a, input"))
          .filter((element) => element.offsetParent !== null)
          .map((element) => {
            const rect = element.getBoundingClientRect();

            return {
              label:
                element.getAttribute("aria-label") ??
                element.textContent?.trim().slice(0, 40) ??
                element.tagName,
              left: rect.left,
              right: rect.right,
              width: rect.width,
              height: rect.height,
            };
          })
          .filter(
            (control) =>
              control.width > 0 &&
              control.height > 0 &&
              (control.left < -1 || control.right > window.innerWidth + 1),
          );
      });

      expect(clipped, `timed exam at ${viewport.name} has clipped controls`).toEqual([]);

      await page.evaluate((key) => localStorage.removeItem(key), TIMED_EXAM_STORAGE_KEY);
    }
  });

  test("mobile navigation opens a usable drawer without page overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openRoute(page, "/");

    await page.getByRole("button", { name: "Open navigation" }).click();

    const sidebar = page.getByRole("complementary", { name: "Primary" });
    await expect(sidebar).toBeVisible();
    await expect
      .poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().x))
      .toBeGreaterThanOrEqual(0);

    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(391);

    const links = page
      .getByRole("navigation", { name: "Sections" })
      .getByRole("link");
    await expect(links).toHaveCount(8);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Close navigation" })).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("desktop keeps the persistent sidebar and hides the drawer toggle", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openRoute(page, "/");

    await expect(page.getByRole("complementary", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Sections" })).toBeVisible();
  });

  test("lesson table of contents only appears where it fits", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openRoute(page, "/learn/workflow-design");

    const toc = page.getByRole("navigation", { name: "On this page" });
    await expect(toc).toBeHidden();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(toc).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
