import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  getAssessment,
  getAssessmentQuestions,
  getQuestionCurriculumContext,
} from "../content";
import {
  type AssessmentDefinition,
  assessmentDefinitionSchema,
  createAssessmentContext,
  type Question,
  questionSchema,
  startAssessment,
  submitAssessment,
} from "../domain";
import { AssessmentRunner } from "../features/assessment/components/AssessmentRunner";

const singleQuestion: Question = questionSchema.parse({
  id: "ui-single-question",
  type: "single-choice",
  stem: "Which action removes stale context? Select one.",
  choices: [
    { id: "wrong", text: "Wrong choice: raise temperature.", explanation: "Incorrect: does not trim context." },
    { id: "right", text: "Correct choice: retrieve relevant sections.", explanation: "Correct: reduces noise." },
    { id: "also-wrong", text: "Paste the whole handbook.", explanation: "Incorrect: increases noise." },
  ],
  correctChoiceIds: ["right"],
  correctExplanation: "Selective context retrieval addresses the root cause directly.",
  sourceIds: ["anthropic-context-windows-doc"],
});

const multipleQuestion: Question = questionSchema.parse({
  id: "ui-multiple-question",
  type: "multiple-response",
  stem: "Which two actions reduce context noise? Select two.",
  choices: [
    { id: "retrieve", text: "Retrieve only relevant sections.", explanation: "Correct: eliminates redundant documents." },
    { id: "paste", text: "Paste the entire handbook.", explanation: "Incorrect: increases noise." },
    { id: "summarize", text: "Summarize older turns.", explanation: "Correct: preserves necessary signals." },
  ],
  correctChoiceIds: ["retrieve", "summarize"],
  correctExplanation: "These two choices reduce noise while preserving essential signals.",
  sourceIds: ["anthropic-context-windows-doc"],
});

const definition: AssessmentDefinition = assessmentDefinitionSchema.parse({
  id: "ui-assessment",
  title: "UI Assessment",
  description: "Exercises the interactive test runner.",
  questionIds: ["ui-single-question", "ui-multiple-question"],
  policy: {
    scoring: "all-or-nothing",
    allowAnswerChangesBeforeSubmit: true,
  },
});

function renderRunner() {
  return render(
    <MemoryRouter>
      <AssessmentRunner
        definition={definition}
        questions={[singleQuestion, multipleQuestion]}
      />
    </MemoryRouter>,
  );
}

describe("AssessmentRunner", () => {
  it("walks through questions, answers, flags, submits, and starts over", async () => {
    const user = userEvent.setup();
    renderRunner();

    expect(screen.getByRole("heading", { name: definition.title })).toBeInTheDocument();
    expect(screen.getByText("2 questions")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start assessment" }));

    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    expect(screen.getByText(/0 of 2 answered/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Flag question" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await user.click(screen.getByRole("button", { name: "Flag question" }));
    expect(screen.getByRole("button", { name: "Unflag question" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(
      screen.getByRole("radio", { name: /Correct choice: retrieve relevant sections/i }),
    );
    expect(screen.getByText(/1 of 2 answered/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Question 1, answered, flagged" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Select all answers that apply.")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /Retrieve only relevant sections/i }));
    await user.click(screen.getByRole("checkbox", { name: /Summarize older turns/i }));
    expect(screen.getByText(/2 of 2 answered/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit assessment" }));
    expect(
      screen.getByRole("heading", { name: "Submit this assessment?" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/All questions are answered/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot change answers after submission/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm submission" }));

    expect(screen.getByRole("heading", { name: "Practice results" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Practice results" })).toHaveFocus();
    expect(screen.getAllByText("100%")).toHaveLength(2);
    expect(screen.getByText("Total questions").closest(".stat")).toHaveTextContent("2");
    const correctStat = screen.getAllByText("Correct").find((el) => el.classList.contains("stat-label"));
    expect(correctStat?.closest(".stat")).toHaveTextContent("2");
    const incorrectStat = screen.getAllByText("Incorrect").find((el) => el.classList.contains("stat-label"));
    expect(incorrectStat?.closest(".stat")).toHaveTextContent("0");
    expect(screen.getByText("Unanswered").closest(".stat")).toHaveTextContent("0");

    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    expect(screen.getAllByText(/Correct answer/)).toHaveLength(4);
    expect(screen.getByText(/These two choices reduce noise/i)).toBeInTheDocument();

    expect(screen.getByRole("checkbox", { name: /Retrieve only relevant/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Question 1, correct, flagged" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit assessment" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New attempt" }));
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    expect(screen.getByText(/0 of 2 answered/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Practice results" })).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Wrong choice/i })).not.toBeChecked();
  });

  it("moves focus to the question stem when the active question changes", async () => {
    const user = userEvent.setup();
    renderRunner();

    await user.click(screen.getByRole("button", { name: "Start assessment" }));
    expect(screen.getByText(singleQuestion.stem)).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(multipleQuestion.stem)).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText(singleQuestion.stem)).toHaveFocus();
  });

  it("cancels confirmation, then handles unanswered questions and restart", async () => {
    const user = userEvent.setup();
    renderRunner();

    await user.click(screen.getByRole("button", { name: "Start assessment" }));
    await user.click(screen.getByRole("radio", { name: /Wrong choice/i }));
    await user.click(screen.getByRole("button", { name: "Submit assessment" }));

    expect(screen.getByText(/1 question is unanswered/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Keep working" }));
    expect(screen.queryByRole("heading", { name: "Submit this assessment?" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit assessment" })).toHaveFocus();
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit assessment" }));
    await user.click(screen.getByRole("button", { name: "Confirm submission" }));

    expect(screen.getAllByText("0%")).toHaveLength(2);
    const failStat = screen.getAllByText("Incorrect").find((el) => el.classList.contains("stat-label"));
    expect(failStat?.closest(".stat")).toHaveTextContent("1");
    expect(screen.getByText("Unanswered").closest(".stat")).toHaveTextContent("1");
    expect(screen.getByRole("status")).toHaveTextContent("Incorrect");
    expect(screen.getByRole("button", { name: "Question 1, incorrect" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Question 2, unanswered" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Question 2, unanswered" }));
    expect(screen.getByRole("status")).toHaveTextContent("Unanswered");

    await user.click(screen.getByRole("button", { name: "Question 1, incorrect" }));
    expect(screen.getByRole("status")).toHaveTextContent("Incorrect");
    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    expect(screen.getByText("Your answer")).toBeInTheDocument();
  });

  it("renders per-objective breakdown and question curriculum context for a single-domain set", () => {
    const d7Def = getAssessment("domain-7-troubleshooting-set")!;
    const d7Questions = getAssessmentQuestions(d7Def);
    const d7Context = createAssessmentContext(d7Def, d7Questions);
    const submittedSession = submitAssessment(
      d7Context,
      startAssessment(d7Context, {
        sessionId: "d7-sub-1",
        startedAt: "2026-10-28T09:00:00.000Z",
      }),
      "2026-10-28T09:10:00.000Z",
    ).session;

    render(
      <MemoryRouter>
        <AssessmentRunner
          definition={d7Def}
          questions={d7Questions}
          initialSession={submittedSession}
        />
      </MemoryRouter>,
    );

    const objTable = screen.getByRole("table", {
      name: "Attempt breakdown by official objective",
    });
    expect(within(objTable).getAllByRole("row")).toHaveLength(4); // header + 3 D7 objectives
    expect(
      within(objTable).getAllByRole("link", { name: /Lesson:/i })[0],
    ).toHaveAttribute("href", "/learn/troubleshooting-optimization");

    const qContext = getQuestionCurriculumContext(d7Questions[0]!.id)!;
    expect(
      screen.getByRole("heading", { name: "Related objective & lesson" }),
    ).toBeInTheDocument();
    expect(screen.getByText(qContext.objective!.statement, { selector: ".question-context-meta *" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: `Review lesson: ${qContext.lesson!.title}` }),
    ).toHaveAttribute("href", `/learn/${qContext.lesson!.id}`);
    expect(
      screen.getByRole("heading", { name: "Reference sources" }),
    ).toBeInTheDocument();
  });

  it("renders per-domain breakdown with lesson and domain practice links for a multi-domain set", () => {
    const mixedDef = getAssessment("mixed-foundations-set")!;
    const mixedQuestions = getAssessmentQuestions(mixedDef);
    const mixedContext = createAssessmentContext(mixedDef, mixedQuestions);
    const submittedSession = submitAssessment(
      mixedContext,
      startAssessment(mixedContext, {
        sessionId: "mixed-sub-1",
        startedAt: "2026-10-28T09:00:00.000Z",
      }),
      "2026-10-28T09:30:00.000Z",
    ).session;

    render(
      <MemoryRouter>
        <AssessmentRunner
          definition={mixedDef}
          questions={mixedQuestions}
          initialSession={submittedSession}
        />
      </MemoryRouter>,
    );

    const domainTable = screen.getByRole("table", {
      name: "Attempt breakdown by official domain",
    });
    expect(within(domainTable).getAllByRole("row")).toHaveLength(8); // header + 7 official domains
    expect(
      within(domainTable).getByRole("link", { name: "Practice Domain 2" }),
    ).toHaveAttribute("href", "/practice?set=domain-2-output-validation-set");
  });
});
