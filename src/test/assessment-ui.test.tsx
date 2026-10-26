import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  assessmentDefinitionSchema,
  questionSchema,
  type AssessmentDefinition,
  type Question,
} from "../domain";
import { AssessmentRunner } from "../features/assessment/components/AssessmentRunner";

const singleQuestion: Question = questionSchema.parse({
  id: "ui-single-question",
  type: "single-choice",
  stem: "Which action removes stale context? Select one.",
  choices: [
    { id: "wrong", text: "Wrong choice: raise temperature.", explanation: "Sai: không giảm ngữ cảnh." },
    { id: "right", text: "Correct choice: retrieve relevant sections.", explanation: "Đúng: giảm nhiễu." },
    { id: "also-wrong", text: "Paste the whole handbook.", explanation: "Sai: tăng nhiễu." },
  ],
  correctChoiceIds: ["right"],
  correctExplanation: "Chọn lọc ngữ cảnh là cách xử lý gốc rễ.",
  sourceIds: ["anthropic-context-windows-doc"],
});

const multipleQuestion: Question = questionSchema.parse({
  id: "ui-multiple-question",
  type: "multiple-response",
  stem: "Which two actions reduce context noise? Select two.",
  choices: [
    { id: "retrieve", text: "Retrieve only relevant sections.", explanation: "Đúng: giảm tài liệu thừa." },
    { id: "paste", text: "Paste the entire handbook.", explanation: "Sai: tăng nhiễu." },
    { id: "summarize", text: "Summarize older turns.", explanation: "Đúng: giữ thông tin cần thiết." },
  ],
  correctChoiceIds: ["retrieve", "summarize"],
  correctExplanation: "Hai lựa chọn này giảm nhiễu mà vẫn giữ thông tin cần thiết.",
  sourceIds: ["anthropic-context-windows-doc"],
});

const definition: AssessmentDefinition = assessmentDefinitionSchema.parse({
  id: "ui-assessment",
  title: "UI assessment",
  description: "A deterministic component-test assessment.",
  questionIds: ["ui-single-question", "ui-multiple-question"],
  policy: {
    scoring: "all-or-nothing",
    allowAnswerChangesBeforeSubmit: true,
  },
});

function renderRunner() {
  render(<AssessmentRunner definition={definition} questions={[singleQuestion, multipleQuestion]} />);
}

describe("assessment runner", () => {
  it("starts, changes answers, navigates, flags, confirms, and scores exact sets", async () => {
    const user = userEvent.setup();
    renderRunner();

    expect(screen.getByRole("heading", { name: "UI assessment" })).toBeInTheDocument();
    expect(screen.getByText(/You can change answers before you submit/i)).toBeInTheDocument();
    expect(screen.getByText(/no partial credit/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start assessment" }));

    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Not answered")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: /Wrong choice/i }));
    expect(screen.getByText("Answered")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Flag question" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Flag question" }));
    expect(screen.getByRole("button", { name: "Unflag question" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Not answered")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: "Previous" }));
    await user.click(screen.getByRole("radio", { name: /Correct choice/i }));
    expect(screen.getByRole("radio", { name: /Wrong choice/i })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: /Correct choice/i })).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("checkbox", { name: /Retrieve only relevant/i }));
    await user.click(screen.getByRole("checkbox", { name: /Summarize older turns/i }));

    await user.click(screen.getByRole("button", { name: "Submit assessment" }));
    expect(
      screen.getByRole("heading", { name: "Submit this assessment?" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/All questions are answered/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot change answers after submission/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm submission" }));

    expect(screen.getByRole("heading", { name: "Kết quả luyện tập" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kết quả luyện tập" })).toHaveFocus();
    expect(screen.getAllByText("100%")).toHaveLength(2);
    expect(screen.getByText("Tổng số câu").closest(".stat")).toHaveTextContent("2");
    expect(screen.getByText("Đúng").closest(".stat")).toHaveTextContent("2");
    expect(screen.getByText("Sai").closest(".stat")).toHaveTextContent("0");
    expect(screen.getByText("Chưa trả lời").closest(".stat")).toHaveTextContent("0");

    expect(screen.getByRole("status")).toHaveTextContent("Chính xác");
    expect(screen.getAllByText(/Đáp án đúng/)).toHaveLength(2);
    expect(screen.getByText(/Hai lựa chọn này giảm nhiễu/i)).toBeInTheDocument();

    expect(screen.getByRole("checkbox", { name: /Retrieve only relevant/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Question 1, correct, flagged" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit assessment" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New attempt" }));
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    expect(screen.getByText(/0 of 2 answered/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Kết quả luyện tập" })).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Wrong choice/i })).not.toBeChecked();
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
    expect(screen.getByText("Sai").closest(".stat")).toHaveTextContent("1");
    expect(screen.getByText("Chưa trả lời").closest(".stat")).toHaveTextContent("1");
    expect(screen.getByRole("status")).toHaveTextContent("Chưa đúng");
    expect(screen.getByRole("button", { name: "Question 1, incorrect" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Question 2, unanswered" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Question 2, unanswered" }));
    expect(screen.getByRole("status")).toHaveTextContent("Chưa trả lời");

    await user.click(screen.getByRole("button", { name: "Question 1, incorrect" }));
    expect(screen.getByRole("status")).toHaveTextContent("Chưa đúng");
    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    expect(screen.getByText("Your answer")).toBeInTheDocument();
  });
});
