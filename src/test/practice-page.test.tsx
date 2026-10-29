import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { getAssessment, getAssessmentQuestions } from "../content";
import {
  chooseAnswer,
  createAssessmentContext,
  startAssessment,
  submitAssessment,
} from "../domain";
import { PracticePage } from "../pages/PracticePage";
import {
  resetStudyData,
  saveStudySession,
  startStudyAttempt,
} from "../persistence/study-store";

function renderPractice(path = "/practice") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <PracticePage />
    </MemoryRouter>,
  );
}

describe("practice page", () => {
  beforeEach(() => {
    resetStudyData();
  });

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
    expect(screen.getByText("19 questions")).toBeInTheDocument();
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
    expect(screen.getByText("11 questions")).toBeInTheDocument();
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

  it("displays Not started, In progress, and Completed status badges derived from local study state", () => {
    const d5Definition = getAssessment("domain-5-configuration-set")!;
    const d5Questions = getAssessmentQuestions(d5Definition);
    const d5Context = createAssessmentContext(d5Definition, d5Questions);
    const d5First = d5Questions[0]!;

    // 1. Initially all sets are Not started
    const initialView = render(
      <MemoryRouter initialEntries={["/practice"]}>
        <PracticePage />
      </MemoryRouter>,
    );
    const initialD5Card = screen.getByRole("link", {
      name: /Domain 5: Configuration and Knowledge Management/i,
    });
    expect(within(initialD5Card).getByText("Not started")).toBeInTheDocument();
    initialView.unmount();

    // 2. Start an active attempt on Domain 5 and answer 1 of 11 questions -> In progress (1/11 answered)
    let session1 = startAssessment(d5Context, {
      sessionId: "d5-active-1",
      startedAt: "2026-10-28T09:00:00.000Z",
    });
    startStudyAttempt(d5Definition, session1, {
      kind: "practice",
      practiceSetId: d5Definition.id,
    });
    session1 = chooseAnswer(
      d5Context,
      session1,
      d5First.id,
      d5First.correctChoiceIds,
    );
    saveStudySession(session1);

    const inProgressView = render(
      <MemoryRouter initialEntries={["/practice"]}>
        <PracticePage />
      </MemoryRouter>,
    );
    const inProgressD5Card = screen.getByRole("link", {
      name: /Domain 5: Configuration and Knowledge Management/i,
    });
    expect(
      within(inProgressD5Card).getByText("In progress (1/11 answered)"),
    ).toBeInTheDocument();
    inProgressView.unmount();

    // 3. Submit that attempt (1/11 = 9.09%) -> Completed (Last: 9.09% · 1 attempt)
    const submitted1 = submitAssessment(
      d5Context,
      session1,
      "2026-10-28T09:05:00.000Z",
    );
    saveStudySession(submitted1.session);

    const completedView = render(
      <MemoryRouter initialEntries={["/practice"]}>
        <PracticePage />
      </MemoryRouter>,
    );
    const completedD5Card = screen.getByRole("link", {
      name: /Domain 5: Configuration and Knowledge Management/i,
    });
    expect(
      within(completedD5Card).getByText("Completed (Last: 9.09% · 1 attempt)"),
    ).toBeInTheDocument();
    completedView.unmount();

    // 4. Start a second attempt while keeping the prior completed attempt -> combined status
    const session2 = startAssessment(d5Context, {
      sessionId: "d5-active-2",
      startedAt: "2026-10-28T10:00:00.000Z",
    });
    startStudyAttempt(d5Definition, session2, {
      kind: "practice",
      practiceSetId: d5Definition.id,
    });

    renderPractice();
    const combinedD5Card = screen.getByRole("link", {
      name: /Domain 5: Configuration and Knowledge Management/i,
    });
    expect(
      within(combinedD5Card).getByText(
        "In progress (0/11 answered) · Last: 9.09% · 1 attempt",
      ),
    ).toBeInTheDocument();
  });

  it("filters practice sets by category, search text, and status with empty state reset", () => {
    renderPractice();

    // 1. Initial render shows all 11 sets
    expect(screen.getByText(/Hiển thị 11 \/ 11 bộ đề/i)).toBeInTheDocument();

    // 2. Filter by "Theo từng Domain (7)"
    const domainTab = screen.getByRole("button", { name: /Theo từng Domain/i });
    fireEvent.click(domainTab);
    expect(domainTab).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Hiển thị 7 \/ 11 bộ đề/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /High-Weight Core/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Domain 1: Prompting/i })).toBeInTheDocument();

    // 3. Filter by "Chuyên sâu & Ôn nhanh (4)"
    const specTab = screen.getByRole("button", { name: /Chuyên sâu & Ôn nhanh/i });
    fireEvent.click(specTab);
    expect(specTab).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Hiển thị 4 \/ 11 bộ đề/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /High-Weight Core/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quick Drill/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Enterprise Scenarios/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mixed foundations set/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Domain 1: Prompting/i })).not.toBeInTheDocument();

    // 4. Search query
    const searchInput = screen.getByLabelText(/Tìm kiếm bộ đề thực hành/i);
    fireEvent.change(searchInput, { target: { value: "drill" } });
    expect(screen.getByText(/Hiển thị 1 \/ 11 bộ đề/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quick Drill/i })).toBeInTheDocument();

    // 5. Empty search result and reset
    fireEvent.change(searchInput, { target: { value: "non-existent-query-xyz" } });
    expect(screen.getByText("Không tìm thấy bộ đề phù hợp")).toBeInTheDocument();
    const resetBtn = screen.getByRole("button", { name: "Đặt lại bộ lọc" });
    fireEvent.click(resetBtn);
    expect(screen.getByText(/Hiển thị 11 \/ 11 bộ đề/i)).toBeInTheDocument();
  });
});
