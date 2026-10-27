import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PracticePage } from "../pages/PracticePage";

function renderPractice(path = "/practice") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <PracticePage />
    </MemoryRouter>,
  );
}

describe("practice page", () => {
  it("lists the registry-driven practice sets", () => {
    renderPractice();

    expect(screen.getByRole("heading", { name: "Practice questions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reviewed practice sets" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Domain 2: Output Evaluation and Validation/i }),
    ).toHaveAttribute("href", "/practice?set=domain-2-output-validation-set");
    expect(
      screen.getByRole("link", { name: /Mixed foundations set/i }),
    ).toHaveAttribute("href", "/practice?set=mixed-foundations-set");
    expect(
      screen.queryByRole("heading", { name: "Context Window sample check" }),
    ).not.toBeInTheDocument();
  });

  it("opens a selected set from its deep link and runs the reviewed bank", () => {
    renderPractice("/practice?set=domain-2-output-validation-set");

    expect(
      screen.getAllByRole("heading", {
        level: 2,
        name: "Domain 2: Output Evaluation and Validation",
      }),
    ).toHaveLength(2);
    expect(screen.getByText("14 questions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start assessment" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All practice sets" })).toHaveAttribute(
      "href",
      "/practice",
    );
  });

  it("handles an unknown set without inventing content", () => {
    renderPractice("/practice?set=not-a-real-set");

    expect(
      screen.getByRole("heading", { name: "That practice set was not found" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to practice sets" })).toHaveAttribute(
      "href",
      "/practice",
    );
  });
});
