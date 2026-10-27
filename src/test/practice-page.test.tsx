import { render, screen, within } from "@testing-library/react";
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

  it("keeps numbered badges on single-domain sets", () => {
    renderPractice();

    const cases = [
      [/Domain 1: Prompting and Task Execution/i, "1"],
      [/Domain 2: Output Evaluation and Validation/i, "2"],
      [/Domain 3: Product and Model Selection/i, "3"],
      [/Domain 4: Workflow Integration and Solution Design/i, "4"],
      [/Domain 5: Configuration and Knowledge Management/i, "5"],
      [/Domain 6: Governance, Risk, and Responsible Use/i, "6"],
      [/Domain 7: Troubleshooting and Optimization/i, "7"],
    ] as const;

    for (const [name, code] of cases) {
      const card = screen.getByRole("link", { name });
      expect(card.querySelector(".row-start")).toHaveTextContent(new RegExp(`^${code}$`));
    }
  });

  it("uses a compact mixed-set badge instead of the concatenated domain ids", () => {
    renderPractice();

    const mixedCard = screen.getByRole("link", { name: /Mixed foundations set/i });
    const badge = mixedCard.querySelector(".row-start");

    expect(badge).toHaveTextContent(/^M$/);
    expect(badge).not.toHaveTextContent("1·2·3·4·6·7");
    expect(within(mixedCard).getByText("Mixed foundations set")).toBeInTheDocument();
    expect(within(mixedCard).getByText("Open")).toBeInTheDocument();
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

  it("opens the reviewed Domain 5 set from its deep link", () => {
    renderPractice("/practice?set=domain-5-configuration-set");

    expect(
      screen.getAllByRole("heading", {
        level: 2,
        name: "Domain 5: Configuration and Knowledge Management",
      }),
    ).toHaveLength(2);
    expect(screen.getByText("8 questions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start assessment" })).toBeInTheDocument();
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
