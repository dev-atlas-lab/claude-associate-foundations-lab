import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../hooks/ThemeProvider";
import { routes } from "../router";
import { installMatchMedia } from "./match-media";

function renderApp(initialPath: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });

  render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  );

  return router;
}

describe("unknown routes", () => {
  beforeEach(() => {
    installMatchMedia(true);
  });

  it("shows a deliberate 404 inside the shell and offers a way back", async () => {
    const user = userEvent.setup();
    renderApp("/this-route-does-not-exist");

    expect(
      await screen.findByRole("heading", { level: 1, name: "This page does not exist" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/this-route-does-not-exist/)).toBeInTheDocument();
    expect(screen.getByText("Page not found", { selector: ".breadcrumb-current" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Back to dashboard" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Your study desk" }),
    ).toBeInTheDocument();
  });

  it("keeps an unknown lesson inside the lesson route with its own state", async () => {
    renderApp("/learn/not-a-real-lesson");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Lesson not found" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to modules" })).toBeInTheDocument();
  });
});
