import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests run against the production build served by `vite preview`.
 * `vite preview` serves the same `index.html` for every route, matching the
 * history fallback that `vercel.json` configures in deployment. The suite is
 * intentionally Chromium-only: it is a regression and accessibility gate, not a
 * cross-browser compatibility matrix.
 */
const PORT = 4173;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  // CI also writes a static HTML report so failed runs can be downloaded as an
  // artifact. Local runs keep the concise list output only.
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  expect: {
    timeout: 7_500,
  },
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Test the production bundle behind Vite's SPA history fallback, which is
    // the same deep-link behaviour `vercel.json` configures in deployment.
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    // Always build and serve this run's bundle; never reuse a stray dev server.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
