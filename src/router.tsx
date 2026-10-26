import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { GlossaryPage } from "./pages/GlossaryPage";
import { LearnPage } from "./pages/LearnPage";
import { LessonPage } from "./pages/LessonPage";
import { MockExamPage } from "./pages/MockExamPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PracticePage } from "./pages/PracticePage";
import { ProgressPage } from "./pages/ProgressPage";
import { ReviewPage } from "./pages/ReviewPage";
import { SettingsPage } from "./pages/SettingsPage";

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
      { path: "review", element: <ReviewPage /> },
      { path: "progress", element: <ProgressPage /> },
      { path: "glossary", element: <GlossaryPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
