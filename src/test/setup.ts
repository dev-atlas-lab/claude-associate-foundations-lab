import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom has no layout engine, so scrolling is a no-op in tests.
Object.defineProperty(window, "scrollTo", { value: () => {}, writable: true });

afterEach(() => {
  cleanup();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.themePreference;
  document.documentElement.style.colorScheme = "";
  document.body.style.overflow = "";
});
