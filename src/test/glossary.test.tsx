import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../hooks/ThemeProvider";
import { glossary } from "../content";
import { routes } from "../router";
import { installMatchMedia } from "./match-media";

function renderGlossary() {
  render(
    <ThemeProvider>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/glossary"] })} />
    </ThemeProvider>,
  );
}

describe("glossary search", () => {
  beforeEach(() => {
    installMatchMedia(true);
  });

  it("lists every term with its Vietnamese equivalent", async () => {
    renderGlossary();

    await screen.findByRole("searchbox", { name: "Search terms" });
    expect(screen.getByRole("status")).toHaveTextContent(`${glossary.length} terms`);
    expect(screen.getByRole("heading", { level: 2, name: "Token" })).toBeInTheDocument();
    const tokenEntry = glossary.find((entry) => entry.term === "Token")!;
    expect(screen.getByText(tokenEntry.vi)).toBeInTheDocument();
  });

  it("filters by English term, Vietnamese term, or definition text", async () => {
    const user = userEvent.setup();
    renderGlossary();

    await screen.findByRole("searchbox", { name: "Search terms" });
    await user.type(screen.getByRole("searchbox", { name: "Search terms" }), "context");

    expect(screen.getByRole("status")).toHaveTextContent(new RegExp(`of ${glossary.length} terms`));
    expect(screen.getByRole("heading", { level: 2, name: "Context window" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: "Token" })).not.toBeInTheDocument();
  });

  it("explains an empty result and can clear the filter", async () => {
    const user = userEvent.setup();
    renderGlossary();

    await screen.findByRole("searchbox", { name: "Search terms" });
    await user.type(screen.getByRole("searchbox", { name: "Search terms" }), "zzzz");

    expect(screen.getByRole("heading", { level: 2, name: "No matching terms" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show all terms" }));

    expect(screen.getByRole("status")).toHaveTextContent(`${glossary.length} terms`);
    expect(screen.getByRole("heading", { level: 2, name: "Token" })).toBeInTheDocument();
  });

  it("filters terms by category chip", async () => {
    const user = userEvent.setup();
    renderGlossary();

    await screen.findByRole("searchbox", { name: "Search terms" });

    const filterGroup = screen.getByRole("group", { name: "Filter terms by category" });
    const allButton = within(filterGroup).getByRole("button", { name: /All categories/i });
    expect(allButton).toHaveAttribute("aria-pressed", "true");

    const categoryButtons = within(filterGroup).getAllByRole("button");
    expect(categoryButtons.length).toBeGreaterThan(1);

    const firstCategoryButton = categoryButtons[1]!;
    await user.click(firstCategoryButton);

    expect(firstCategoryButton).toHaveAttribute("aria-pressed", "true");
    expect(allButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("status")).toHaveTextContent(new RegExp(`of ${glossary.length} terms`));

    // Reset back to All
    await user.click(allButton);
    expect(allButton).toHaveAttribute("aria-pressed", "true");
    expect(firstCategoryButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("status")).toHaveTextContent(`${glossary.length} terms`);
  });
});
