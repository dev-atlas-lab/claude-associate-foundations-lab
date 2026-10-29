import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromptCachingCostCalculator } from "../features/visualizations/PromptCachingCostCalculator";
import { PromptLayeringWorkbench } from "../features/visualizations/PromptLayeringWorkbench";
import { WorkflowPatternsSimulator } from "../features/visualizations/WorkflowPatternsSimulator";

describe("WorkflowPatternsSimulator", () => {
  it("renders pattern tabs and switches patterns", () => {
    render(<WorkflowPatternsSimulator intro="Test intro for workflow simulator" />);

    expect(
      screen.getByRole("heading", { name: "Mô phỏng Trực quan: Các Mẫu Thiết kế Workflow" })
    ).toBeInTheDocument();
    expect(screen.getByText("Test intro for workflow simulator")).toBeInTheDocument();

    // Verify pattern options
    const routingTab = screen.getByRole("button", { name: /1\. Routing/i });
    const loopTab = screen.getByRole("button", { name: /2\. Evaluator-Optimizer/i });
    const parallelTab = screen.getByRole("button", { name: /3\. Parallelization/i });
    const orchTab = screen.getByRole("button", { name: /4\. Orchestrator-Workers/i });

    expect(routingTab).toHaveAttribute("aria-pressed", "true");

    // Switch to Evaluator-Optimizer
    fireEvent.click(loopTab);
    expect(loopTab).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Generator LLM")).toBeInTheDocument();
    expect(screen.getByText(/Chạy Kiểm định Lần 1/i)).toBeInTheDocument();

    // Advance Evaluator step
    const advanceBtn = screen.getByRole("button", { name: /Chạy Kiểm định Lần 1/i });
    fireEvent.click(advanceBtn);
    expect(screen.getByText(/Đạt tiêu chuẩn/i)).toBeInTheDocument();

    // Switch to Parallelization
    fireEvent.click(parallelTab);
    expect(screen.getByText(/Rà soát Pháp lý/i)).toBeInTheDocument();
    expect(screen.getByText(/Thẩm định Tài chính/i)).toBeInTheDocument();

    // Switch to Orchestrator
    fireEvent.click(orchTab);
    expect(screen.getByText("Lead Orchestrator")).toBeInTheDocument();
  });

  it("switches routing queries and renders corresponding targets", () => {
    render(<WorkflowPatternsSimulator intro="Routing test" />);

    const sample2Btn = screen.getByRole("button", { name: /Mẫu 2: Sự cố Kỹ thuật/i });
    fireEvent.click(sample2Btn);

    expect(screen.getByText(/Senior Tech Diagnostic/i)).toBeInTheDocument();
    expect(screen.getByText("Sự cố Kỹ thuật Kiến trúc")).toBeInTheDocument();

    const sample3Btn = screen.getByRole("button", { name: /Mẫu 3: Pháp chế/i });
    fireEvent.click(sample3Btn);

    expect(screen.getByText(/Human Legal Checkpoint/i)).toBeInTheDocument();
    expect(screen.getByText("Pháp chế & Rủi ro Cao")).toBeInTheDocument();
  });
});

describe("PromptCachingCostCalculator", () => {
  it("renders model selection, sliders, and updates savings dynamically", () => {
    render(<PromptCachingCostCalculator intro="Cost calculator intro" />);

    expect(
      screen.getByRole("heading", { name: "Công cụ Tương tác: Tính Toán Chi Phí & Lợi Ích Prompt Caching" })
    ).toBeInTheDocument();

    // Default is Sonnet 3.5
    const sonnetBtn = screen.getByRole("button", { name: /Claude 3.5 Sonnet/i });
    expect(sonnetBtn).toHaveAttribute("aria-pressed", "true");

    // Cache eligibility is active for default 25,000 tokens
    expect(screen.getByText(/Prompt Caching được kích hoạt tự động/i)).toBeInTheDocument();
    expect(screen.getByText(/Chi phí Khi Dùng Prompt Caching/i)).toBeInTheDocument();

    // Switch to Haiku
    const haikuBtn = screen.getByRole("button", { name: /Claude 3.5 Haiku/i });
    fireEvent.click(haikuBtn);
    expect(haikuBtn).toHaveAttribute("aria-pressed", "true");

    // Adjust turns slider
    const turnsSlider = screen.getByLabelText(/Số lượt truy vấn trong phiên làm việc 5 phút/i);
    fireEvent.change(turnsSlider, { target: { value: "30" } });
    expect(screen.getByText("30 lượt gọi API")).toBeInTheDocument();

    // Switch to Opus
    const opusBtn = screen.getByRole("button", { name: /Claude 3 Opus/i });
    fireEvent.click(opusBtn);
    expect(opusBtn).toHaveAttribute("aria-pressed", "true");
  });
});

describe("PromptLayeringWorkbench", () => {
  it("toggles prompt layers, updates metrics, and toggles code view", () => {
    render(<PromptLayeringWorkbench intro="Workbench intro" />);

    expect(
      screen.getByRole("heading", { name: "Bàn Thử Nghiệm: Cấu Trúc Đa Lớp Prompt Chuẩn Anthropic" })
    ).toBeInTheDocument();

    // Toggle few-shot layer on
    const fewShotBtn = screen.getByRole("button", { name: /4\. Few-Shot Exemplars/i });
    fireEvent.click(fewShotBtn);
    expect(fewShotBtn).toHaveAttribute("aria-pressed", "true");

    // Toggle code view expansion
    const toggleCodeBtn = screen.getByRole("button", { name: /Mở rộng toàn màn hình/i });
    fireEvent.click(toggleCodeBtn);
    expect(screen.getByRole("button", { name: /Thu gọn code/i })).toBeInTheDocument();

    // Select all layers
    const selectAllBtn = screen.getByRole("button", { name: /Kích hoạt tất cả/i });
    fireEvent.click(selectAllBtn);
    expect(screen.getByText(/5 lớp kích hoạt/i)).toBeInTheDocument();

    // Reset layers
    const resetBtn = screen.getByRole("button", { name: /Khởi tạo lại/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText(/1 lớp kích hoạt/i)).toBeInTheDocument();
  });
});
