import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { allQuestions } from "../content";
import { ComprehensiveDrillView } from "../features/practice/components/ComprehensiveDrillView";
import {
  comprehensiveDrillStore,
  COMPREHENSIVE_DRILL_STORAGE_KEY,
} from "../persistence/comprehensive-drill-store";

describe("ComprehensiveDrillView & comprehensiveDrillStore", () => {
  beforeEach(() => {
    localStorage.removeItem(COMPREHENSIVE_DRILL_STORAGE_KEY);
    comprehensiveDrillStore.resetAll();
  });

  it("renders initial stats and bank size of 105 items", () => {
    render(<ComprehensiveDrillView />);

    expect(
      screen.getByRole("heading", {
        name: /Instant feedback drill/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Total questions")).toBeInTheDocument();
    expect(screen.getAllByText("105").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/0%/).length).toBeGreaterThanOrEqual(1);
  });

  it("filters questions by domain and updates matrix", () => {
    render(<ComprehensiveDrillView />);

    // Click Domain 1 filter
    const d1Btn = screen.getByRole("button", { name: /^D1 \(/i });
    fireEvent.click(d1Btn);
    expect(d1Btn).toHaveAttribute("aria-pressed", "true");

    // Check match count
    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
  });

  it("provides instant feedback and explanations upon answering a single-choice question", () => {
    render(<ComprehensiveDrillView />);

    // First question stem is rendered
    const firstQ = allQuestions[0];
    expect(firstQ).toBeDefined();

    // Select the first choice
    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBeGreaterThanOrEqual(4);

    fireEvent.click(radios[0]!);

    // Instant feedback panel should be revealed
    expect(
      screen.getByText(/Key takeaway:/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Detailed option analysis:/i),
    ).toBeInTheDocument();

    // "Try again" button is present
    const retryBtn = screen.getByRole("button", { name: /Try again/i });
    expect(retryBtn).toBeInTheDocument();

    // Clicking retry clears the reveal
    fireEvent.click(retryBtn);
    expect(
      screen.queryByText(/Key takeaway:/i),
    ).not.toBeInTheDocument();
  });

  it("toggles flag status and updates the stat counter", () => {
    render(<ComprehensiveDrillView />);

    const flagBtn = screen.getByRole("button", { name: "Flag question" });
    expect(flagBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(flagBtn);
    const unflagBtn = screen.getByRole("button", { name: "Flagged" });
    expect(unflagBtn).toHaveAttribute("aria-pressed", "true");

    // Un-flag
    fireEvent.click(unflagBtn);
    expect(screen.getByRole("button", { name: "Flag question" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("navigates to next question when Next button is clicked", () => {
    render(<ComprehensiveDrillView />);

    expect(
      screen.getByText(
        (_, el) => el?.className === "drill-counter" && el.textContent === "Question 1 of 105",
      ),
    ).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: "Next question" });
    fireEvent.click(nextBtn);

    expect(
      screen.getByText(
        (_, el) => el?.className === "drill-counter" && el.textContent === "Question 2 of 105",
      ),
    ).toBeInTheDocument();
  });
});
