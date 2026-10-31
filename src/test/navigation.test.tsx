import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../hooks/ThemeProvider";
import { routes } from "../router";
import { installMatchMedia } from "./match-media";

function renderApp(initialPath = "/") {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });

  render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  );

  return router;
}

function primaryNav() {
  return screen.getByRole("navigation", { name: "Sections" });
}

describe("application shell navigation", () => {
  beforeEach(() => {
    installMatchMedia(true);
  });

  it("renders the dashboard with the full navigation", async () => {
    renderApp();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Your study desk" }),
    ).toBeInTheDocument();
    expect(within(primaryNav()).getAllByRole("link")).toHaveLength(8);
    expect(within(primaryNav()).getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("moves between sections and marks the active link", async () => {
    const user = userEvent.setup();
    renderApp();

    await screen.findByRole("heading", { level: 1, name: "Your study desk" });
    await user.click(within(primaryNav()).getByRole("link", { name: "Practice" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Practice questions" }),
    ).toBeInTheDocument();
    expect(within(primaryNav()).getByRole("link", { name: "Practice" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(primaryNav()).getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("opens a lesson from the module list and keeps Learn active", async () => {
    const user = userEvent.setup();
    renderApp();

    await screen.findByRole("heading", { level: 1, name: "Your study desk" });
    await user.click(within(primaryNav()).getByRole("link", { name: "Learn" }));
    expect(
      await screen.findByRole("heading", { level: 2, name: "Available now" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("link", { name: /Context window and context budgeting/i }),
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Context window and context budgeting" }),
    ).toBeInTheDocument();
    expect(within(primaryNav()).getByRole("link", { name: "Learn" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByText("Lesson", { selector: ".breadcrumb-current" })).toBeInTheDocument();
  });

  it("renders every placeholder route inside the same shell", async () => {
    const paths: [string, string][] = [
      ["/mock-exam", "Mock exam"],
      ["/review", "Review mistakes"],
      ["/progress", "Learning progress"],
      ["/glossary", "Technical glossary"],
      ["/settings", "Preferences"],
    ];

    for (const [path, heading] of paths) {
      const { unmount } = render(
        <ThemeProvider>
          <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
        </ThemeProvider>,
      );

      expect(await screen.findByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
      expect(primaryNav()).toBeInTheDocument();
      unmount();
    }
  });

  it("opens the mobile drawer, locks scrolling, and closes on Escape", async () => {
    const user = userEvent.setup();
    renderApp();

    await screen.findByRole("heading", { level: 1, name: "Your study desk" });
    const toggle = screen.getByRole("button", { name: "Open navigation" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.body.style.overflow).toBe("hidden");
    const sidebar = screen.getByRole("complementary", { name: "Primary" });
    expect(within(sidebar).getByRole("button", { name: "Close navigation" })).toHaveFocus();

    await user.keyboard("{Escape}");

    await waitFor(() => expect(toggle).toHaveAttribute("aria-expanded", "false"));
    expect(document.body.style.overflow).toBe("");
    await waitFor(() => expect(toggle).toHaveFocus());
  });
});
