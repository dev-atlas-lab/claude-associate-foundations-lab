import { expect, test } from "@playwright/test";
import {
  expectDocumentTheme,
  openRoute,
  setTheme,
} from "./helpers/app";
import { getLesson } from "./helpers/fixtures";

const routes = [
  "/",
  "/learn",
  "/practice",
  "/mock-exam",
  "/review",
  "/progress",
  "/glossary",
  "/settings",
];

test.describe("theme handling", () => {
  test("starts in the documented dark default and exposes one pressed option", async ({ page }) => {
    await openRoute(page, "/");

    await expectDocumentTheme(page, "dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "dark");

    const group = page.getByRole("banner").getByRole("group", { name: "Theme" });
    const pressed = group.getByRole("button", { pressed: true });

    await expect(pressed).toHaveCount(1);
    await expect(pressed).toHaveAccessibleName("Dark theme");
  });

  test("light theme persists across routes and a hard reload", async ({ page }) => {
    await openRoute(page, "/");
    await setTheme(page, "light");
    await expectDocumentTheme(page, "light");

    for (const route of routes) {
      await openRoute(page, route);
      await expectDocumentTheme(page, "light");
      await expect(
        page.getByRole("banner").getByRole("group", { name: "Theme" }).getByRole("button", {
          name: "Light theme",
        }),
      ).toHaveAttribute("aria-pressed", "true");
    }

    await page.reload();
    await expectDocumentTheme(page, "light");
    expect(await page.evaluate(() => localStorage.getItem("cfl.theme"))).toBe("light");
  });

  test("the Settings radio group changes and persists the theme", async ({ page }) => {
    await openRoute(page, "/settings");

    const light = page.getByRole("radio", { name: /^Light/ });
    const dark = page.getByRole("radio", { name: /^Dark/ });

    await expect(dark).toBeChecked();
    await light.check();
    await expectDocumentTheme(page, "light");
    await expect(light).toBeChecked();

    await page.reload();
    await expectDocumentTheme(page, "light");
    await expect(page.getByRole("radio", { name: /^Light/ })).toBeChecked();

    await page.getByRole("radio", { name: /^Dark/ }).check();
    await expectDocumentTheme(page, "dark");
    await page.reload();
    await expectDocumentTheme(page, "dark");
    await expect(page.getByRole("radio", { name: /^Dark/ })).toBeChecked();
  });

  test("System follows prefers-color-scheme live and after reload", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await openRoute(page, "/");
    await setTheme(page, "system");
    await expectDocumentTheme(page, "light");
    await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");

    await page.emulateMedia({ colorScheme: "dark" });
    await expectDocumentTheme(page, "dark");

    await page.emulateMedia({ colorScheme: "light" });
    await page.reload();
    await expectDocumentTheme(page, "light");
    await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
    expect(await page.evaluate(() => localStorage.getItem("cfl.theme"))).toBe("system");
  });

  test("theme changes do not alter the learning content or course state", async ({ page }) => {
    const lesson = getLesson("workflow-design")!;
    await openRoute(page, "/learn/workflow-design");
    const heading = page.getByRole("heading", { level: 1 });

    await expect(heading).toHaveText(lesson.title);
    await setTheme(page, "light");
    await expect(heading).toHaveText(lesson.title);
    await expect(page.getByRole("heading", { name: "Mục tiêu bài học" })).toBeVisible();

    await setTheme(page, "dark");
    await expect(heading).toHaveText(lesson.title);
    await expect(page.getByRole("heading", { name: "Mục tiêu bài học" })).toBeVisible();
  });
});
