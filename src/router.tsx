import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import {
  DashboardPage,
  GlossaryPage,
  LearnPage,
  LessonPage,
  MockExamPage,
  NotFoundPage,
  PracticePage,
  ProgressPage,
  ReviewPage,
  SettingsPage,
  TimedExamPage,
} from "./routes/lazy-pages";

/**
 * AppShell stays in the initial chunk; each page loads on first navigation so
 * the dashboard is not blocked by the assessment runner or content-heavy views.
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "learn", element: <LearnPage /> },
      { path: "learn/:lessonId", element: <LessonPage /> },
      { path: "practice", element: <PracticePage /> },
      { path: "mock-exam", element: <MockExamPage /> },
      { path: "mock-exam/timed", element: <TimedExamPage /> },
      { path: "review", element: <ReviewPage /> },
      { path: "progress", element: <ProgressPage /> },
      { path: "glossary", element: <GlossaryPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
