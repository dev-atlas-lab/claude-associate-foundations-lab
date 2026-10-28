import { lazy } from "react";

/**
 * Lazy route components. Kept out of router.tsx so that file only exports route
 * objects; this also gives Fast Refresh a component-only module to work with.
 */
export const DashboardPage = lazy(() =>
  import("../pages/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
export const GlossaryPage = lazy(() =>
  import("../pages/GlossaryPage").then((module) => ({ default: module.GlossaryPage })),
);
export const LearnPage = lazy(() =>
  import("../pages/LearnPage").then((module) => ({ default: module.LearnPage })),
);
export const LessonPage = lazy(() =>
  import("../pages/LessonPage").then((module) => ({ default: module.LessonPage })),
);
export const MockExamPage = lazy(() =>
  import("../pages/MockExamPage").then((module) => ({ default: module.MockExamPage })),
);
export const NotFoundPage = lazy(() =>
  import("../pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })),
);
export const PracticePage = lazy(() =>
  import("../pages/PracticePage").then((module) => ({ default: module.PracticePage })),
);
export const ProgressPage = lazy(() =>
  import("../pages/ProgressPage").then((module) => ({ default: module.ProgressPage })),
);
export const ReviewPage = lazy(() =>
  import("../pages/ReviewPage").then((module) => ({ default: module.ReviewPage })),
);
export const SettingsPage = lazy(() =>
  import("../pages/SettingsPage").then((module) => ({ default: module.SettingsPage })),
);
export const TimedExamPage = lazy(() =>
  import("../pages/TimedExamPage").then((module) => ({ default: module.TimedExamPage })),
);
