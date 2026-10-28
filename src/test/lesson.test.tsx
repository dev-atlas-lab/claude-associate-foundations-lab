import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
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
      await screen.findByRole("heading", { level: 1, name: "Context window và ngân sách ngữ cảnh" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Chưa gắn với objective chính thức").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { level: 2, name: "Mục tiêu bài học" })).toBeInTheDocument();

    const termList = screen.getByRole("heading", { level: 2, name: "Thuật ngữ chính" }).closest("section");
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

    await screen.findByRole("heading", { level: 1, name: "Context window và ngân sách ngữ cảnh" });
    const outputButton = screen.getByRole("button", { name: /Reserved for output/i });
    expect(outputButton).toHaveAttribute("aria-pressed", "false");

    await user.click(outputButton);

    expect(outputButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Input và output chia sẻ cùng một cửa sổ/i)).toBeInTheDocument();
  });

  it("scores a correct answer and explains every option", async () => {
    const user = userEvent.setup();
    renderLesson();

    await screen.findByRole("heading", { level: 1, name: "Context window và ngân sách ngữ cảnh" });
    const submit = screen.getByRole("button", { name: "Check answer" });
    expect(submit).toBeDisabled();

    await user.click(
      screen.getByRole("radio", { name: /Retrieve only the relevant policy sections/i }),
    );
    expect(submit).toBeEnabled();

    await user.click(submit);

    const feedback = screen.getByRole("status");
    expect(feedback).toHaveTextContent("Chính xác");
    expect(feedback).toHaveFocus();
    expect(screen.getByText(/Đáp án đúng/)).toBeInTheDocument();
    expect(screen.getAllByText(/Vì sao không chọn/)).toHaveLength(3);

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

    await screen.findByRole("heading", { level: 1, name: "Context window và ngân sách ngữ cảnh" });
    await user.click(screen.getByRole("radio", { name: /Raise the temperature/i }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("status")).toHaveTextContent("Chưa đúng");
    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    expect(screen.getByText("Your answer")).toBeInTheDocument();

    expect(screen.getByText("This is the first lesson")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Đánh giá output: accuracy, evidence/i }),
    ).toHaveAttribute("href", "/learn/evaluation-basics");
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
        explanation: "Đúng: giảm tài liệu không liên quan.",
      },
      {
        id: "paste",
        text: "Paste the entire handbook.",
        explanation: "Sai: tăng nhiễu và chiếm ngân sách.",
      },
      {
        id: "summarize",
        text: "Summarize older turns.",
        explanation: "Đúng: giữ lại thông tin cần thiết.",
      },
    ],
    correctChoiceIds: ["retrieve", "summarize"],
    correctExplanation: "Hai lựa chọn này giảm nhiễu mà vẫn giữ thông tin cần thiết.",
    sourceIds: ["anthropic-context-windows-doc"],
  });

  it("uses checkboxes and scores the selected set, not just one option", async () => {
    const user = userEvent.setup();
    render(<KnowledgeCheck question={question} />);

    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /Retrieve only relevant/i }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status")).toHaveTextContent("Chưa đúng");

    await user.click(screen.getByRole("button", { name: /Try again/i }));
    await user.click(screen.getByRole("checkbox", { name: /Retrieve only relevant/i }));
    await user.click(screen.getByRole("checkbox", { name: /Summarize older turns/i }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("status")).toHaveTextContent("Chính xác");
    expect(screen.getAllByText(/Đáp án đúng/)).toHaveLength(2);
  });
});
