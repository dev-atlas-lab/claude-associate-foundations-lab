import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { getAssessment, getAssessmentQuestions } from "../content";
import {
  resolveTimedExamQuestions,
  selectTimedExamQuestionIds,
  timedExamAssessmentId,
  timedExamBlueprintId,
  timedExamDurationMinutes,
  timedExamPolicy,
} from "../content/timed-exam";
import {
  chooseAnswer,
  createAssessmentContext,
  createTimedExamContext,
  createTimedExamSession,
  startAssessment,
  submitAssessment,
  submitTimedExam,
} from "../domain";
import { PracticePage } from "../pages/PracticePage";
import { ReviewPage } from "../pages/ReviewPage";
import { STUDY_STORAGE_KEY } from "../persistence/storage";
import {
  reloadStudyStore,
  resetStudyData,
  saveStudySession,
  startStudyAttempt,
} from "../persistence/study-store";
import {
  resetTimedExamStoreForTests,
  saveTimedExamSession,
  startTimedExam,
} from "../persistence/timed-exam-store";

afterEach(() => {
  resetStudyData();
  resetTimedExamStoreForTests();
});

function renderPractice() {
  return render(
    <MemoryRouter initialEntries={["/practice?set=domain-2-output-validation-set"]}>
      <PracticePage />
    </MemoryRouter>,
  );
}

function renderReview() {
  return render(
    <MemoryRouter initialEntries={["/review"]}>
      <ReviewPage />
    </MemoryRouter>,
  );
}

async function submitEmptyAttempt() {
  const user = userEvent.setup();
  const view = renderPractice();

  await user.click(screen.getByRole("button", { name: "Start assessment" }));
  await user.click(screen.getByRole("button", { name: "Submit assessment" }));
  await user.click(screen.getByRole("button", { name: "Confirm submission" }));

  return { user, view };
}

function readEnvelope() {
  return JSON.parse(localStorage.getItem(STUDY_STORAGE_KEY) ?? "{}") as {
    schemaVersion?: number;
    state?: { attempts?: Array<{ session: { status: string } }> };
  };
}

describe("persisted study journey", () => {
  it("writes a submitted attempt, restores it, and starts a new attempt", async () => {
    const { user, view } = await submitEmptyAttempt();

    expect(screen.getByRole("heading", { name: "Kết quả luyện tập" })).toBeInTheDocument();
    expect(screen.getAllByText("0%").length).toBeGreaterThan(0);

    const envelope = readEnvelope();

    expect(envelope.schemaVersion).toBe(1);
    expect(envelope.state?.attempts).toHaveLength(1);
    expect(envelope.state?.attempts?.[0]?.session.status).toBe("submitted");

    view.unmount();
    reloadStudyStore();
    renderPractice();

    expect(await screen.findByRole("heading", { name: "Kết quả luyện tập" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New attempt" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New attempt" }));

    expect(await screen.findByText(/Question 1 of 19/)).toBeInTheDocument();
    expect(screen.getByText("Not answered")).toBeInTheDocument();

    const afterNewAttempt = readEnvelope();

    expect(afterNewAttempt.state?.attempts?.map((attempt) => attempt.session.status)).toEqual([
      "submitted",
      "in-progress",
    ]);
  });

  it("shows the derived queue and resolves an item only on request", async () => {
    const { view } = await submitEmptyAttempt();
    view.unmount();

    const review = renderReview();

    expect(screen.getByRole("heading", { name: "Review mistakes" })).toBeInTheDocument();
    expect(screen.getByText("19 open items")).toBeInTheDocument();

    const queueSection = screen.getByRole("heading", { name: "Open queue" }).closest("section");
    expect(queueSection).not.toBeNull();

    const user = userEvent.setup();
    await user.click(
      within(screen.getByRole("list", { name: "Open review items" })).getAllByRole("link")[0]!,
    );

    expect(screen.getByText("Review item")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark reviewed" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Review queue" }));

    expect(screen.getByText("19 open items")).toBeInTheDocument();

    await user.click(
      within(screen.getByRole("list", { name: "Open review items" })).getAllByRole("link")[0]!,
    );
    await user.click(screen.getByRole("button", { name: "Mark reviewed" }));

    expect(
      screen.getByRole("heading", { name: "Marked reviewed. This item left the queue." }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Back to review queue" }));

    expect(screen.getByText("18 open items")).toBeInTheDocument();
    expect(screen.getByText("1 resolved")).toBeInTheDocument();

    review.unmount();
  });

  it("shows domain/objective context, remediation links, repeat-miss indicator, and submitted timed-exam items", async () => {
    const d2Def = getAssessment("domain-2-output-validation-set")!;
    const d2Questions = getAssessmentQuestions(d2Def);
    const d2Context = createAssessmentContext(d2Def, d2Questions);
    const firstQ = d2Questions[0]!;
    const wrongChoice = firstQ.choices.find(
      (choice) => !firstQ.correctChoiceIds.includes(choice.id),
    )!;

    // Submit 2 attempts where firstQ is answered incorrectly both times
    for (let idx = 1; idx <= 2; idx += 1) {
      let session = startAssessment(d2Context, {
        sessionId: `d2-repeat-${idx}`,
        startedAt: `2026-10-28T0${idx}:00:00.000Z`,
      });
      startStudyAttempt(d2Def, session, {
        kind: "practice",
        practiceSetId: d2Def.id,
      });
      session = chooseAnswer(d2Context, session, firstQ.id, [wrongChoice.id]);
      for (const q of d2Questions.slice(1)) {
        session = chooseAnswer(d2Context, session, q.id, q.correctChoiceIds);
      }
      saveStudySession(
        submitAssessment(d2Context, session, `2026-10-28T0${idx}:10:00.000Z`).session,
      );
    }

    // Also start and submit a timed exam
    const timedQuestionIds = selectTimedExamQuestionIds("timed-rev-1");
    const timedStarted = startTimedExam(
      createTimedExamSession({
        sessionId: "timed-rev-1",
        assessmentId: timedExamAssessmentId,
        blueprintId: timedExamBlueprintId,
        questionIds: timedQuestionIds,
        policy: timedExamPolicy,
        durationMinutes: timedExamDurationMinutes,
        startedAt: "2026-10-28T05:00:00.000Z",
      }),
    );
    const timedResolved = resolveTimedExamQuestions(timedStarted.questionIds);
    const timedSubmitted = submitTimedExam(
      createTimedExamContext(timedStarted, timedResolved.questions),
      timedStarted,
      new Date(
        Date.parse("2026-10-28T05:00:00.000Z") + timedExamDurationMinutes * 30_000,
      ).toISOString(),
    ).session;
    saveTimedExamSession(timedSubmitted);

    const user = userEvent.setup();
    renderReview();

    expect(screen.getAllByText("Missed in 2 attempts").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Saved timed exam slot").length).toBeGreaterThan(0);

    // Open the repeat-missed study item
    const queue = screen.getByRole("list", { name: "Open review items" });
    const studyItemLink = within(queue)
      .getAllByRole("link")
      .find((link) => link.textContent?.includes("Missed in 2 attempts"))!;
    await user.click(studyItemLink);

    expect(
      screen.getByRole("heading", { name: "Mục tiêu & bài học liên quan" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Repeated mistake: câu hỏi này đã trả lời sai trong 2 lần nộp bài/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Ôn lại bài học:/i }),
    ).toHaveAttribute("href", "/learn/evaluation-basics");
    expect(
      screen.getByRole("link", { name: "Luyện tập Domain 2" }),
    ).toHaveAttribute("href", "/practice?set=domain-2-output-validation-set");
    expect(
      screen.getByRole("heading", { name: "Nguồn tham chiếu" }),
    ).toBeInTheDocument();
  });

  it("allows practicing open review items in memory and marking correctly answered items reviewed", async () => {
    const d2Def = getAssessment("domain-2-output-validation-set")!;
    const d2Questions = getAssessmentQuestions(d2Def);
    const d2Context = createAssessmentContext(d2Def, d2Questions);
    const firstQ = d2Questions[0]!;
    const secondQ = d2Questions[1]!;
    const wrongFirst = firstQ.choices.find(
      (choice) => !firstQ.correctChoiceIds.includes(choice.id),
    )!;
    const wrongSecond = secondQ.choices.find(
      (choice) => !secondQ.correctChoiceIds.includes(choice.id),
    )!;

    // Submit an attempt with 2 incorrect answers (firstQ and secondQ) and the rest correct
    let session = startAssessment(d2Context, {
      sessionId: "d2-review-practice-source",
      startedAt: "2026-10-28T06:00:00.000Z",
    });
    startStudyAttempt(d2Def, session, {
      kind: "practice",
      practiceSetId: d2Def.id,
    });
    session = chooseAnswer(d2Context, session, firstQ.id, [wrongFirst.id]);
    session = chooseAnswer(d2Context, session, secondQ.id, [wrongSecond.id]);
    for (const q of d2Questions.slice(2)) {
      session = chooseAnswer(d2Context, session, q.id, q.correctChoiceIds);
    }
    saveStudySession(
      submitAssessment(d2Context, session, "2026-10-28T06:10:00.000Z").session,
    );

    const user = userEvent.setup();
    renderReview();

    expect(screen.getByText("2 open items")).toBeInTheDocument();
    const practiceLink = screen.getByRole("link", {
      name: "Practice open items (2)",
    });
    expect(practiceLink).toHaveAttribute("href", "/review?mode=practice");

    await user.click(practiceLink);

    expect(
      screen.getByRole("heading", { name: "Open review items practice" }),
    ).toBeInTheDocument();
    expect(screen.getByText("In-memory practice")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start assessment" }));

    // Answer firstQ correctly and leave secondQ unanswered
    for (const choiceId of firstQ.correctChoiceIds) {
      const choiceText = firstQ.choices.find((choice) => choice.id === choiceId)!.text;
      await user.click(
        screen.getByRole(firstQ.type === "multiple-response" ? "checkbox" : "radio", {
          name: new RegExp(choiceText.slice(0, 24).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        }),
      );
    }

    await user.click(screen.getByRole("button", { name: "Submit assessment" }));
    await user.click(screen.getByRole("button", { name: "Confirm submission" }));

    expect(
      screen.getByRole("heading", { name: "Review queue resolution" }),
    ).toBeInTheDocument();
    const markCorrectButton = screen.getByRole("button", {
      name: "Mark 1 correct item reviewed",
    });
    await user.click(markCorrectButton);

    expect(
      screen.getByText(/Marked 1 correct item reviewed/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getAllByRole("link", { name: "Back to review queue" })[0]!,
    );

    expect(screen.getByText("1 open items")).toBeInTheDocument();
    expect(screen.getByText("1 resolved")).toBeInTheDocument();
  });

  it("supports starting a shuffled practice attempt, persisting its question order across reload, and shuffling on retry", async () => {
    const d2Def = getAssessment("domain-2-output-validation-set")!;
    const user = userEvent.setup();
    const view = renderPractice();

    await user.click(screen.getByRole("button", { name: "Start shuffled" }));

    expect(screen.getByText(/Shuffled order/)).toBeInTheDocument();

    const envelope = JSON.parse(localStorage.getItem(STUDY_STORAGE_KEY) ?? "{}") as {
      state?: {
        attempts?: Array<{
          questionIds: string[];
          session: { id: string; status: string };
        }>;
      };
    };
    const firstAttempt = envelope.state?.attempts?.[0];
    expect(firstAttempt).toBeDefined();
    expect(firstAttempt!.questionIds).toHaveLength(d2Def.questionIds.length);
    expect([...firstAttempt!.questionIds].sort()).toEqual([...d2Def.questionIds].sort());
    expect(firstAttempt!.questionIds).not.toEqual(d2Def.questionIds);

    // Reload and verify the exact shuffled order is restored
    view.unmount();
    reloadStudyStore();
    renderPractice();

    expect(screen.getByText(/Shuffled order/)).toBeInTheDocument();
    const firstShuffledQuestion = getAssessmentQuestions({
      ...d2Def,
      questionIds: [firstAttempt!.questionIds[0]!],
    })[0]!;
    expect(screen.getByText(firstShuffledQuestion.stem)).toBeInTheDocument();

    // Submit and verify Shuffle & retry starts a fresh shuffled attempt
    await user.click(screen.getByRole("button", { name: "Submit assessment" }));
    await user.click(screen.getByRole("button", { name: "Confirm submission" }));

    expect(screen.getByRole("button", { name: "Shuffle & retry" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Shuffle & retry" }));

    expect(screen.getByText(/In progress · Shuffled order/)).toBeInTheDocument();
  });
});
