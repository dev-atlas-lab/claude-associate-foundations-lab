import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PracticePage } from "../pages/PracticePage";

describe("practice page", () => {
  it("runs the reviewed Domain 2 bank instead of the unmapped sample", () => {
    render(
      <MemoryRouter>
        <PracticePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Practice questions" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Domain 2: Output Evaluation and Validation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("14 questions")).toBeInTheDocument();
    expect(
      screen.getAllByText(/Accuracy and completeness, hallucination\/inconsistency/i)
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole("heading", { name: "Context Window sample check" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Domain 2 lesson" }),
    ).toHaveAttribute("href", "/learn/evaluation-basics");
    expect(
      screen.getByRole("link", { name: "Context Window sample lesson" }),
    ).toHaveAttribute("href", "/learn/context-window");
  });
});
