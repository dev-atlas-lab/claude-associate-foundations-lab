import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HallucinationEvaluationSandbox } from "../features/visualizations/HallucinationEvaluationSandbox";
import { ModelSelectionMatrix } from "../features/visualizations/ModelSelectionMatrix";
import { PromptCachingCostCalculator } from "../features/visualizations/PromptCachingCostCalculator";
import { PromptLayeringWorkbench } from "../features/visualizations/PromptLayeringWorkbench";
import { SafetyGuardrailsSimulator } from "../features/visualizations/SafetyGuardrailsSimulator";
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

describe("ModelSelectionMatrix", () => {
  it("renders workload presets, switches presets and updates model recommendations", () => {
    render(<ModelSelectionMatrix intro="Model matrix intro" />);

    expect(screen.getByText("Model matrix intro")).toBeInTheDocument();

    // Default preset is customer-triage with Haiku recommended
    expect(screen.getAllByText(/Gợi ý: HAIKU/i).length).toBeGreaterThanOrEqual(1);

    // Switch to coding-agent preset
    const codingPresetBtn = screen.getByRole("button", {
      name: /AI Coding Assistant & Tự động hóa Review Code/i,
    });
    fireEvent.click(codingPresetBtn);
    expect(codingPresetBtn).toHaveAttribute("aria-pressed", "true");

    // Check that slider values updated to coding preset values (4,000 input tokens)
    expect(screen.getByText("4,000 tokens")).toBeInTheDocument();

    // Model cards are present and selectable
    const sonnetCard = screen.getByRole("button", { name: /Claude 3.5 Sonnet/i });
    fireEvent.click(sonnetCard);
    expect(sonnetCard).toHaveAttribute("aria-pressed", "true");
  });
});

describe("SafetyGuardrailsSimulator", () => {
  it("switches attack scenarios and toggles defense modes", () => {
    render(<SafetyGuardrailsSimulator intro="Safety intro" />);

    expect(screen.getByText("Safety intro")).toBeInTheDocument();

    // Default scenario is indirect injection in guarded mode
    expect(
      screen.getByText(/Indirect Prompt Injection qua Dữ liệu ngoài/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Phòng vệ thành công nhờ Thẻ XML & System Prompt tối thượng/i),
    ).toBeInTheDocument();

    // Switch to Unprotected mode
    const unprotectedBtn = screen.getByRole("button", {
      name: /Chưa bảo vệ \(Nối chuỗi thô - Raw String Concatenation\)/i,
    });
    fireEvent.click(unprotectedBtn);
    expect(unprotectedBtn).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText(/Bị tấn công thành công \(Prompt Injection Exploit\)/i),
    ).toBeInTheDocument();

    // Switch to Jailbreak scenario
    const jailbreakBtn = screen.getByRole("button", {
      name: /Jailbreak & Role Hijacking/i,
    });
    fireEvent.click(jailbreakBtn);
    expect(jailbreakBtn).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getAllByText(/FREEDOM_AI/i).length,
    ).toBeGreaterThanOrEqual(1);

    // Toggle back to Guarded mode
    const guardedBtn = screen.getByRole("button", {
      name: /Chuẩn Anthropic Guardrails/i,
    });
    fireEvent.click(guardedBtn);
    expect(
      screen.getByText(/Constitutional AI kích hoạt từ chối an toàn/i),
    ).toBeInTheDocument();
  });
});

describe("HallucinationEvaluationSandbox", () => {
  it("renders scenario selector and switches scenarios", () => {
    render(<HallucinationEvaluationSandbox intro="Evaluation sandbox intro" />);

    expect(screen.getByText("Evaluation sandbox intro")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Bàn Thử Nghiệm Tương Tác: Nhận Diện Hallucination & Thẩm Định Output/i,
      }),
    ).toBeInTheDocument();

    // Default scenario is Finance Q3
    expect(
      screen.getByRole("button", { name: /Tình huống 1: Báo cáo Tài chính Q3/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", { name: /Tài liệu Nguồn Xác thực/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Văn bản do Claude tạo ra/i }),
    ).toBeInTheDocument();

    // Switch to Legal NDA scenario
    const legalBtn = screen.getByRole("button", { name: /Tình huống 2: Thỏa thuận Bảo mật NDA/i });
    fireEvent.click(legalBtn);
    expect(legalBtn).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText(/Hợp đồng Bảo mật Thông tin NDA-2026/i),
    ).toBeInTheDocument();

    // Switch to Healthcare Dosage scenario
    const healthBtn = screen.getByRole("button", { name: /Tình huống 3: Hướng dẫn Kê đơn/i });
    fireEvent.click(healthBtn);
    expect(healthBtn).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText(/Dược thư Quốc gia: Hướng dẫn Kê đơn/i),
    ).toBeInTheDocument();
  });

  it("classifies claims, triggers verification, displays score and resets", () => {
    render(<HallucinationEvaluationSandbox />);

    // In Finance scenario:
    // Claim 1 (claim-1): Internal Inconsistency
    const claim1Group = screen.getByRole("group", { name: "Phân loại claim-1" });
    const claim1Btns = claim1Group.querySelectorAll("button");
    const inconsistencyBtn1 = Array.from(claim1Btns).find((b) =>
      b.textContent?.includes("Internal Inconsistency"),
    );
    expect(inconsistencyBtn1).toBeDefined();
    fireEvent.click(inconsistencyBtn1!);

    // Claim 2 (claim-2): Verified Accurate
    const claim2Group = screen.getByRole("group", { name: "Phân loại claim-2" });
    const claim2Btns = claim2Group.querySelectorAll("button");
    const verifiedBtn2 = Array.from(claim2Btns).find((b) =>
      b.textContent?.includes("Verified Accurate"),
    );
    expect(verifiedBtn2).toBeDefined();
    fireEvent.click(verifiedBtn2!);

    // Claim 3 (claim-3): Factual Hallucination
    const claim3Group = screen.getByRole("group", { name: "Phân loại claim-3" });
    const claim3Btns = claim3Group.querySelectorAll("button");
    const factualBtn3 = Array.from(claim3Btns).find((b) =>
      b.textContent?.includes("Factual Hallucination"),
    );
    expect(factualBtn3).toBeDefined();
    fireEvent.click(factualBtn3!);

    // Verification button should now be enabled
    const verifyBtn = screen.getByRole("button", {
      name: /Kiểm định & Đối chiếu Rubric Anthropic/i,
    });
    expect(verifyBtn).not.toBeDisabled();
    fireEvent.click(verifyBtn);

    // Score summary is displayed
    expect(screen.getByText(/Kết quả thẩm định của bạn/i)).toBeInTheDocument();
    expect(screen.getByText(/claims chính xác/i)).toBeInTheDocument();

    // Reset button returns to interactive state
    const resetBtn = screen.getByRole("button", { name: /Thử lại kịch bản này/i });
    fireEvent.click(resetBtn);

    expect(screen.queryByText(/Kết quả thẩm định của bạn/i)).not.toBeInTheDocument();
  });
});
