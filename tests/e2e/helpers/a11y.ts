import { createRequire } from "node:module";
import { expect, type Page } from "@playwright/test";
import type { AxeResults } from "axe-core";

const require = createRequire(import.meta.url);
const axeSourcePath = require.resolve("axe-core/axe.min.js");

interface AxeWindow extends Window {
  axe: {
    run(context: Document, options?: Record<string, unknown>): Promise<AxeResults>;
  };
}

/**
 * Run axe-core in the real browser. No rules are disabled: a failing rule has to
 * be fixed in the application or narrowly justified in the test that scans the
 * affected route.
 */
export async function analysePage(page: Page): Promise<AxeResults> {
  // Finish CSS transitions that started when a control was revealed (for
  // example the reset confirmation). Axe samples the colour at one instant, so
  // a 120ms hover transition would otherwise be reported as a contrast defect
  // even though every resting state passes.
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      try {
        animation.finish();
      } catch {
        // Infinite or paused animations are not part of this check.
      }
    }
  });

  const alreadyLoaded = await page.evaluate(
    () => typeof (window as unknown as AxeWindow).axe !== "undefined",
  );

  if (!alreadyLoaded) {
    await page.addScriptTag({ path: axeSourcePath });
  }

  return page.evaluate(async () => {
    const axe = (window as unknown as AxeWindow).axe;

    return axe.run(document, {
      resultTypes: ["violations"],
    });
  });
}

export function describeViolations(results: AxeResults): string {
  return results.violations
    .map((violation) => {
      const targets = violation.nodes.map((node) => node.target.join(" ")).join(" | ");
      return `${violation.id} [${violation.impact ?? "unknown"}]: ${violation.help} → ${targets}`;
    })
    .join("\n");
}

export async function expectNoViolations(page: Page, label: string): Promise<void> {
  const results = await analysePage(page);
  const summary = describeViolations(results);

  expect(
    results.violations,
    `${label} has ${results.violations.length} axe violation(s):\n${summary}`,
  ).toEqual([]);
}

type Heading = { level: number; text: string };

export async function readHeadings(page: Page): Promise<Heading[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
      .filter((heading) => !heading.closest("[inert]"))
      .map((heading) => ({
        level: Number(heading.tagName.slice(1)),
        text: (heading.textContent ?? "").trim(),
      })),
  );
}

/** Heading order may repeat or go back up, but it must never skip a level. */
export function expectNoSkippedHeadingLevels(headings: Heading[], label: string): void {
  expect(headings[0]?.level, `${label} should start at h1`).toBe(1);

  for (let index = 1; index < headings.length; index += 1) {
    const previous = headings[index - 1]!;
    const current = headings[index]!;

    expect(
      current.level,
      `${label}: "${current.text}" (h${current.level}) skips a level after h${previous.level} "${previous.text}"`,
    ).toBeLessThanOrEqual(previous.level + 1);
  }
}
