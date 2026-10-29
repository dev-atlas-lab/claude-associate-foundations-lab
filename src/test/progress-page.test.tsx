import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAssessment, getAssessmentQuestions } from "../content";
import {
  chooseAnswer,
  createAssessmentContext,
  startAssessment,
  submitAssessment,
} from "../domain";
import { ProgressPage } from "../pages/ProgressPage";
import { resetStudyData, saveStudySession, startStudyAttempt } from "../persistence/study-store";
import { resetTimedExamStoreForTests } from "../persistence/timed-exam-store";

function renderProgress() {
  return render(
    <MemoryRouter initialEntries={["/progress"]}>
      <ProgressPage />
    </MemoryRouter>,
  );
}

describe("progress page readiness and study report", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStudyData();
    resetTimedExamStoreForTests();
    vi.restoreAllMocks();
  });

  it("renders empty personal performance when no attempts are submitted", () => {
    renderProgress();

    expect(screen.getByRole("heading", { name: "Learning progress" })).toBeInTheDocument();
    expect(screen.getByText("No attempts yet")).toBeInTheDocument();
    expect(screen.getByText("No submitted attempts yet")).toBeInTheDocument();
    expect(
      screen.queryByRole("article", { name: "Exam Readiness & Blueprint Balance" }),
    ).not.toBeInTheDocument();
  });

  it("renders the Exam Readiness diagnostic card and priority remediations when an attempt is submitted", () => {
    const d1Assessment = getAssessment("domain-1-prompting-set");
    expect(d1Assessment).toBeDefined();
    if (!d1Assessment) {
      throw new Error("Missing domain-1-prompting-set");
    }
    const d1Questions = getAssessmentQuestions(d1Assessment);
    const d1Context = createAssessmentContext(d1Assessment, d1Questions);

    let session = startAssessment(d1Context, {
      sessionId: "test-progress-session-1",
      startedAt: "2026-10-28T09:00:00.000Z",
    });
    startStudyAttempt(d1Assessment, session, {
      kind: "practice",
      practiceSetId: d1Assessment.id,
    });

    // Answer first 2 questions correctly, 1 incorrectly
    session = chooseAnswer(d1Context, session, d1Questions[0].id, d1Questions[0].correctChoiceIds);
    session = chooseAnswer(d1Context, session, d1Questions[1].id, d1Questions[1].correctChoiceIds);
    // Incorrect choice for 3rd question: pick a non-correct choice
    const wrongChoiceId = d1Questions[2].choices.find(
      (c) => !d1Questions[2].correctChoiceIds.includes(c.id),
    )?.id;
    if (wrongChoiceId) {
      session = chooseAnswer(d1Context, session, d1Questions[2].id, [wrongChoiceId]);
    }

    const submitted = submitAssessment(d1Context, session, "2026-10-28T09:10:00.000Z");
    saveStudySession(submitted.session);

    renderProgress();

    // 1. Readiness card is rendered
    const card = screen.getByRole("article", { name: "Exam Readiness & Blueprint Balance" });
    expect(card).toBeInTheDocument();
    expect(
      screen.getByText(/Chỉ số Sẵn sàng Thi & Cân bằng Blueprint/i),
    ).toBeInTheDocument();

    // 2. Blueprint coverage reflects Domain 1 weight (10%)
    expect(screen.getByText("10%")).toBeInTheDocument();

    // 3. Remediation section is displayed
    expect(
      screen.getByText("Mục tiêu ưu tiên cần củng cố (Top Focus Areas)"),
    ).toBeInTheDocument();
  });

  it("triggers window.print when the In / Xuất Báo cáo button is clicked", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    renderProgress();

    const printButton = screen.getByRole("button", {
      name: /In \/ Xuất Báo cáo/i,
    });
    expect(printButton).toBeInTheDocument();

    fireEvent.click(printButton);
    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});
