import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getLessonForDomain,
  getPracticeSetForDomain,
  primaryBlueprint,
} from "../content";
import { questionSchema } from "../domain";
import { KnowledgeCheck } from "../features/curriculum/components/KnowledgeCheck";
import { ThemeProvider } from "../hooks/ThemeProvider";
import { routes } from "../router";
import { installMatchMedia } from "./match-media";

function renderLesson(path = "/learn/context-window") {
  render(
    <ThemeProvider>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
    </ThemeProvider>,
  );
}

describe("sample lesson", () => {
  beforeEach(() => {
    installMatchMedia(true);
  });
  it("renders the authored structure: objectives, terms, diagram, and check", async () => {
    renderLesson();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Context window and context budgeting" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Not mapped to an official objective").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { level: 2, name: "Lesson objectives" })).toBeInTheDocument();

    const termList = screen.getByRole("heading", { level: 2, name: "Key terms" }).closest("section");
    expect(termList).not.toBeNull();
    expect(screen.getByText("Context window", { selector: "dt" })).toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 2, name: "Knowledge check" })).toBeInTheDocument();
    expect(
      screen.getByText(/A support assistant receives the entire policy handbook/i),
    ).toBeInTheDocument();
  });

  it("lets the reader explore the context-budget diagram", async () => {
    const user = userEvent.setup();
    renderLesson();

    await screen.findByRole("heading", { level: 1, name: "Context window and context budgeting" });
    const outputButton = screen.getByRole("button", { name: /Reserved for output/i });
    expect(outputButton).toHaveAttribute("aria-pressed", "false");

    await user.click(outputButton);

    expect(outputButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Input and output share the single unified context window/i)).toBeInTheDocument();
  });

  it("scores a correct answer and explains every option", async () => {
    const user = userEvent.setup();
    renderLesson();

    await screen.findByRole("heading", { level: 1, name: "Context window and context budgeting" });
    const submit = screen.getByRole("button", { name: "Check answer" });
    expect(submit).toBeDisabled();

    await user.click(
      screen.getByRole("radio", { name: /Retrieve only the relevant policy sections/i }),
    );
    expect(submit).toBeEnabled();

    await user.click(submit);

    const feedback = screen.getByRole("status");
    expect(feedback).toHaveTextContent("Correct");
    expect(feedback).toHaveFocus();
    expect(screen.getAllByText(/Correct answer/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Why this is incorrect/)).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: /Try again/i }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /Retrieve only the relevant policy sections/i }),
    ).toHaveFocus();
    expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled();
  });

  it("marks a wrong answer, reveals the correct option, and keeps the pager honest", async () => {
    const user = userEvent.setup();
    renderLesson();

    await screen.findByRole("heading", { level: 1, name: "Context window and context budgeting" });
    await user.click(screen.getByRole("radio", { name: /Raise the temperature/i }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("status")).toHaveTextContent("Incorrect");
    expect(screen.getAllByText("Correct answer").length).toBeGreaterThan(0);
    expect(screen.getByText("Your answer")).toBeInTheDocument();

    expect(screen.getByText("This is the first lesson")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Evaluating outputs: accuracy, evidence/i }),
    ).toHaveAttribute("href", "/learn/evaluation-basics");
  });

  it("deep-links every exam-mapped lesson directly to its single-domain practice set", async () => {
    for (const domain of primaryBlueprint.domains) {
      const lesson = getLessonForDomain(domain.id)!;
      const practiceSet = getPracticeSetForDomain(domain.id)!;
      const view = render(
        <ThemeProvider>
          <RouterProvider
            router={createMemoryRouter(routes, {
              initialEntries: [`/learn/${lesson.id}`],
            })}
          />
        </ThemeProvider>,
      );

      await screen.findByRole("heading", { level: 1, name: lesson.title });
      const cta = screen.getByRole("link", {
        name: `Open Domain ${domain.code} practice set`,
      });
      expect(cta).toHaveAttribute(
        "href",
        `/practice?set=${encodeURIComponent(practiceSet.assessment.id)}`,
      );
      view.unmount();
    }
  });
});

describe("multiple-response knowledge check", () => {
  const question = questionSchema.parse({
    id: "context-noise-multi",
    type: "multiple-response",
    stem: "Which two actions reduce context noise? Select two.",
    choices: [
      {
        id: "retrieve",
        text: "Retrieve only relevant policy sections.",
        explanation: "Correct: reduces irrelevant background documents.",
      },
      {
        id: "paste",
        text: "Paste the entire handbook.",
        explanation: "Incorrect: increases noise and exhausts context budget.",
      },
      {
        id: "summarize",
        text: "Summarize older turns.",
        explanation: "Correct: preserves necessary decisions and constraints.",
      },
    ],
    correctChoiceIds: ["retrieve", "summarize"],
    correctExplanation: "These two choices reduce noise while preserving essential signals.",
    sourceIds: ["anthropic-context-windows-doc"],
  });

  it("uses checkboxes and scores the selected set, not just one option", async () => {
    const user = userEvent.setup();
    render(<KnowledgeCheck question={question} />);

    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /Retrieve only relevant/i }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status")).toHaveTextContent("Incorrect");

    await user.click(screen.getByRole("button", { name: /Try again/i }));
    await user.click(screen.getByRole("checkbox", { name: /Retrieve only relevant/i }));
    await user.click(screen.getByRole("checkbox", { name: /Summarize older turns/i }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    expect(screen.getAllByText(/Correct answer/)).toHaveLength(4);
  });
});
