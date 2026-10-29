import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getTimedExamQuestion } from "../content/timed-exam";
import type { TimedExamSession } from "../domain";
import { TimedExamIntro } from "../features/timed-exam/components/TimedExamIntro";
import { TimedExamPage } from "../pages/TimedExamPage";
import {
  resetTimedExamStoreForTests,
} from "../persistence/timed-exam-store";
import { TIMED_EXAM_STORAGE_KEY } from "../persistence/timed-exam-storage";

function renderPage(page: ReactNode = <TimedExamPage />) {
  return render(<MemoryRouter initialEntries={["/mock-exam/timed"]}>{page}</MemoryRouter>);
}

function readStoredSession(): TimedExamSession {
  const raw = localStorage.getItem(TIMED_EXAM_STORAGE_KEY);

  if (raw === null) {
    throw new Error("expected a saved timed-exam envelope");
  }

  return (JSON.parse(raw) as { session: TimedExamSession }).session;
}

async function startExam() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Start timed exam" }));
  return user;
}

afterEach(() => {
  vi.restoreAllMocks();
  resetTimedExamStoreForTests();
});

describe("timed exam page", () => {
  it("explains the 60-item format and enables a start when the full bank is available", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "Timed mock exam" }),
    ).toBeInTheDocument();
    expect(screen.getByText("60 items · 120 min")).toBeInTheDocument();
    expect(screen.getByText("60 questions")).toBeInTheDocument();
    expect(screen.getByText("120 minutes")).toBeInTheDocument();
    expect(screen.getByText("62 reviewed items available", { selector: ".badge" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start timed exam" })).toBeEnabled();

    const table = screen.getByRole("table", {
      name: "Timed exam allocation by official domain",
    });

    expect(within(table).getAllByRole("row")).toHaveLength(8);
    expect(within(table).getByRole("row", { name: /Configuration and Knowledge Management/i }))
      .toBeInTheDocument();
  });

  it("disables start and states the exact shortfall when the bank is too small", () => {
    renderPage(
      <TimedExamIntro
        requestedItemCount={60}
        durationMinutes={120}
        availableItemCount={42}
        selectedItemCount={42}
        shortfall={18}
        allocations={[]}
        domains={[]}
        canStart={false}
        onStart={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Start timed exam" }),
    ).toBeDisabled();
    expect(
      screen.getByText(/would be short by 18/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/will not pad the exam/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Starting is disabled until the reviewed bank can fill the full exam."),
    ).toBeInTheDocument();
  });

  it("starts one attempt, saves answers, flags, navigation, and resumes it", async () => {
    const { unmount } = renderPage();
    const user = await startExam();

    expect(
      screen.getByRole("heading", { level: 2, name: "CCAO-F timed mock exam" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 60")).toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveAttribute("aria-live", "off");

    const first = readStoredSession();
    const question = getTimedExamQuestion(first.questionIds[0]!);

    expect(question).toBeDefined();

    const inputRole = question!.type === "multiple-response" ? "checkbox" : "radio";

    for (const choiceId of question!.correctChoiceIds) {
      const choice = question!.choices.find((candidate) => candidate.id === choiceId)!;
      await user.click(screen.getByRole(inputRole, { name: choice.text }));
    }

    expect(
      screen.getByText("Answered", { exact: true, selector: ".assessment-answer-state" }),
    ).toBeInTheDocument();
    expect(readStoredSession().session.answers[question!.id]).toEqual(
      expect.arrayContaining(question!.correctChoiceIds),
    );

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Question 2 of 60")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Flag question" }));
    expect(readStoredSession().session.flaggedQuestionIds).toHaveLength(1);
    expect(readStoredSession().session.currentQuestionIndex).toBe(1);

    unmount();
    resetTimedExamStoreForTests();
    renderPage();

    expect(screen.getByText("Question 2 of 60")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Question 1, answered$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Question 2, unanswered, flagged, current$/ }),
    ).toBeInTheDocument();
  });

  it("submits early, retains a raw result, reviews locked answers, and discards explicitly", async () => {
    renderPage();
    const user = await startExam();
    const session = readStoredSession();
    const question = getTimedExamQuestion(session.questionIds[0]!)!;
    const inputRole = question.type === "multiple-response" ? "checkbox" : "radio";

    for (const choiceId of question.correctChoiceIds) {
      const choice = question.choices.find((candidate) => candidate.id === choiceId)!;
      await user.click(screen.getByRole(inputRole, { name: choice.text }));
    }

    await user.click(screen.getByRole("button", { name: "Submit exam" }));
    const confirmation = screen.getByRole("heading", { name: "Submit the timed exam?" });
    expect(confirmation).toHaveFocus();
    expect(screen.getByText(/recorded as a manual submission/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit exam now" }));

    const resultHeading = screen.getByRole("heading", { name: "Kết quả bài thi thử" });
    expect(resultHeading).toHaveFocus();
    expect(screen.getByText("Manual submission")).toBeInTheDocument();
    expect(screen.getAllByText("1.67%").length).toBeGreaterThan(0);
    expect(screen.getByText("Chưa trả lời").nextElementSibling).toHaveTextContent("59");
    expect(screen.getByText("Nguồn tham chiếu")).toBeInTheDocument();
    expect(screen.getByText(/không phải dự đoán đậu\/rớt/i)).toBeInTheDocument();

    const breakdownTable = screen.getByRole("table", {
      name: "Timed exam performance by official domain",
    });
    expect(within(breakdownTable).getAllByRole("row")).toHaveLength(8);
    expect(
      within(breakdownTable).getByRole("link", { name: "Luyện tập Domain 5" }),
    ).toHaveAttribute("href", "/practice?set=domain-5-configuration-set");
    expect(
      screen.getByRole("heading", { name: "Mục tiêu & bài học liên quan" }),
    ).toBeInTheDocument();

    for (const checkbox of screen.getAllByRole(inputRole)) {
      expect(checkbox).toBeDisabled();
    }

    const stored = readStoredSession();
    expect(stored.session.status).toBe("submitted");
    expect(stored.submissionReason).toBe("user");
    expect(stored.finalResult?.correctAnswers).toBe(1);

    await user.click(screen.getByRole("button", { name: "Start a new timed exam" }));
    expect(
      screen.getByRole("heading", { name: "Start a new timed exam?" }),
    ).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Discard result and continue" }));

    expect(screen.getByRole("button", { name: "Start timed exam" })).toBeEnabled();
    expect(localStorage.getItem(TIMED_EXAM_STORAGE_KEY)).toBeNull();
  });

  it("keeps a corrupt payload until an explicit discard and never touches study data", async () => {
    localStorage.setItem(TIMED_EXAM_STORAGE_KEY, "{not json");
    localStorage.setItem("cfl.study.v1", "keep-study-data");
    resetTimedExamStoreForTests();

    renderPage();

    expect(
      screen.getAllByRole("heading", { name: "Saved timed exam needs attention" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/not valid JSON/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download raw backup" })).toBeInTheDocument();
    expect(localStorage.getItem(TIMED_EXAM_STORAGE_KEY)).toBe("{not json");

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Discard saved timed exam" }));
    await user.click(screen.getByRole("button", { name: "Confirm discard timed exam" }));

    expect(screen.getByRole("button", { name: "Start timed exam" })).toBeEnabled();
    expect(localStorage.getItem(TIMED_EXAM_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem("cfl.study.v1")).toBe("keep-study-data");
  });

  it("blocks an unsupported schema version and shows the stored version", async () => {
    localStorage.setItem(
      TIMED_EXAM_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 2,
        contentFingerprint: "old::timed",
      }),
    );
    resetTimedExamStoreForTests();

    renderPage();

    expect(screen.getByText(/schema version 2/i)).toBeInTheDocument();
    expect(screen.getByText("Stored schema")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("old::timed")).toBeInTheDocument();
    expect(localStorage.getItem(TIMED_EXAM_STORAGE_KEY)).not.toBeNull();
  });

  it("keeps running in memory when localStorage is unavailable", async () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    resetTimedExamStoreForTests();

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      /This browser did not expose localStorage/i,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Start timed exam" }));

    expect(screen.getByText("Question 1 of 60")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/will not be restored after a reload/i);
  });

  it("reports a quota write failure while keeping the attempt usable", async () => {
    vi.spyOn(window, "localStorage", "get").mockReturnValue({
      getItem: () => null,
      setItem: () => {
        const error = new Error("quota");
        error.name = "QuotaExceededError";
        throw error;
      },
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    } as Storage);
    resetTimedExamStoreForTests();

    renderPage();
    await startExam();

    expect(screen.getByText("Question 1 of 60")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/storage is full/i);
  });
});
