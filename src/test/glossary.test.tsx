import { render, screen } from "@testing-library/react";
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
    expect(screen.getByText("Đơn vị token")).toBeInTheDocument();
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
});
