import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { resetStudyStoreForTests } from "../persistence/study-store";
import { resetTimedExamStoreForTests } from "../persistence/timed-exam-store";

// jsdom has no layout engine, so scrolling is a no-op in tests.
Object.defineProperty(window, "scrollTo", { value: () => {}, writable: true });

afterEach(() => {
  cleanup();
  localStorage.clear();
  resetStudyStoreForTests();
  resetTimedExamStoreForTests();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.themePreference;
  document.documentElement.style.colorScheme = "";
  document.body.style.overflow = "";
});
