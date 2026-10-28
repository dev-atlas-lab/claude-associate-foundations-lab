import { expect, type Page } from "@playwright/test";

export const STUDY_STORAGE_KEY = "cfl.study.v1";
export const THEME_STORAGE_KEY = "cfl.theme";

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Navigate and wait for the route's single h1 to prove the lazy page mounted. */
export async function openRoute(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

export async function goToNav(page: Page, name: string): Promise<void> {
  await page
    .getByRole("navigation", { name: "Sections" })
    .getByRole("link", { name, exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

export async function setTheme(
  page: Page,
  theme: "dark" | "light" | "system",
): Promise<void> {
  const label = `${theme[0]!.toUpperCase()}${theme.slice(1)} theme`;

  await page
    .getByRole("banner")
    .getByRole("group", { name: "Theme" })
    .getByRole("button", { name: label })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", theme);
}

export async function expectDocumentTheme(page: Page, theme: "dark" | "light"): Promise<void> {
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

  const colorScheme = await page.locator("html").evaluate((element) => element.style.colorScheme);
  expect(colorScheme).toBe(theme);
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(
    overflow.scrollWidth,
    `document should not scroll horizontally (scrollWidth ${overflow.scrollWidth}, clientWidth ${overflow.clientWidth})`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

export function elementStatCard(page: Page, label: string) {
  return page.locator("article.stat").filter({ has: page.getByText(label, { exact: true }) });
}

export function definitionStat(page: Page, label: string) {
  return page
    .getByRole("term", { name: label, exact: true })
    .locator("..")
    .getByRole("definition");
}

export async function readStudyRaw(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), STUDY_STORAGE_KEY);
}

export async function readStudyEnvelope<T = unknown>(page: Page): Promise<T> {
  const raw = await readStudyRaw(page);

  if (raw === null) {
    throw new Error("expected a saved study envelope, but localStorage was empty");
  }

  return JSON.parse(raw) as T;
}

export async function writeStudyRaw(page: Page, raw: string): Promise<void> {
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    [STUDY_STORAGE_KEY, raw] as const,
  );
}

export interface StudyEnvelopeSnapshot {
  schemaVersion: number;
  contentFingerprint: string;
  savedAt: string;
  state: {
    attempts: Array<{
      session: { id: string; assessmentId: string; status: string };
    }>;
    reviewResolutions: unknown[];
  };
}
