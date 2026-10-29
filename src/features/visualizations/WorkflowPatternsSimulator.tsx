import { useState } from "react";
import { ArrowRight, CheckCircle2, GitBranch, RefreshCw, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

type PatternId = "routing" | "evaluator-optimizer" | "parallelization" | "orchestrator-workers";

interface PatternMeta {
  id: PatternId;
  name: string;
  badge: string;
  summary: string;
  bestFor: string;
  examTakeaway: string;
}

const patterns: PatternMeta[] = [
  {
    id: "routing",
    name: "1. Routing (Intent Classification)",
    badge: "Phổ biến & Chi phí thấp",
    summary:
      "Một model nhẹ (ví dụ Claude 3.5 Haiku) phân loại yêu cầu đầu vào theo ý định (intent) rồi điều hướng đến prompt chuyên biệt hoặc model chuyên sâu.",
    bestFor: "Hệ thống hỗ trợ khách hàng đa chủ đề, phân luồng yêu cầu phức tạp sang chuyên gia hoặc model mạnh hơn.",
    examTakeaway:
      "Tối ưu chi phí và độ trễ bằng cách chỉ dùng model lớn (Sonnet/Opus) cho các nhánh thực sự cần suy luận phức tạp.",
  },
  {
    id: "evaluator-optimizer",
    name: "2. Evaluator-Optimizer Loop",
    badge: "Chất lượng cao có Guardrail",
    summary:
      "Model 1 tạo bản nháp (Generator), Model 2 đóng vai trò kiểm định độc lập (Evaluator) chấm điểm theo Rubric rõ ràng. Lặp lại cho đến khi đạt hoặc chạm mốc giới hạn, có trạm kiểm soát người duyệt (Human checkpoint).",
    bestFor: "Viết báo cáo chuyên sâu, dịch thuật hợp đồng pháp lý, sinh mã nguồn có bộ kiểm thử (test suite).",
    examTakeaway:
      "Chỉ hiệu quả khi tiêu chí nghiệm thu (rubric) đo lường được rõ ràng; luôn cần stopping condition để tránh vòng lặp vô tận tốn token.",
  },
  {
    id: "parallelization",
    name: "3. Parallelization (Sectioning / Voting)",
    badge: "Giảm độ trễ tổng thể",
    summary:
      "Chia một tác vụ lớn thành các nhánh độc lập chạy song song cùng lúc, sau đó dùng một bước tổng hợp (Aggregator) để gom kết quả.",
    bestFor: "Duyệt qua 10 tài liệu độc lập, phân tích rủi ro từ 3 góc nhìn (tài chính, pháp lý, kỹ thuật) cùng lúc.",
    examTakeaway:
      "Thời gian hoàn thành bằng nhánh chạy lâu nhất thay vì tổng thời gian tuần tự; đòi hỏi các bước con không phụ thuộc lẫn nhau.",
  },
  {
    id: "orchestrator-workers",
    name: "4. Orchestrator-Workers",
    badge: "Linh hoạt cho bài toán mở",
    summary:
      "Model trung tâm phân tích mục tiêu của người dùng, tự động phân rã thành danh sách công việc cần làm, giao cho các Worker LLM xử lý, rồi tổng hợp báo cáo.",
    bestFor: "Nghiên cứu thị trường phức tạp, phân tích đối thủ cạnh tranh hoặc tổng hợp tài liệu nhiều bước.",
    examTakeaway:
      "Phức tạp hơn workflow tuần tự; cần giám sát giới hạn số lượt gọi worker và ngân sách token dự phòng.",
  },
];

const routingExamples = [
  {
    query: "“Tài khoản của tôi bị trừ tiền 2 lần vào ngày 15/10, xin hoàn lại.”",
    intent: "Khiếu nại Thanh toán & Hóa đơn",
    target: "Billing Sub-Agent (Claude 3.5 Haiku)",
    risk: "Thấp",
    cost: "Rất thấp (0.001$)",
  },
  {
    query: "“Hệ thống microservices bị nghẽn thread pool khi nhận 50,000 req/s, cần phân tích log.”",
    intent: "Sự cố Kỹ thuật Kiến trúc",
    target: "Senior Tech Diagnostic (Claude 3.5 Sonnet)",
    risk: "Trung bình",
    cost: "Trung bình (0.015$)",
  },
  {
    query: "“Đề xuất chuyển giao quyền sở hữu trí tuệ của thuật toán cho đối tác nước ngoài.”",
    intent: "Pháp chế & Rủi ro Cao",
    target: "Human Legal Checkpoint (Bàn giao Luật sư)",
    risk: "Rất cao",
    cost: "Thẩm định thủ công",
  },
];

export function WorkflowPatternsSimulator({ intro }: { intro: string }) {
  const [selectedPattern, setSelectedPattern] = useState<PatternId>("routing");
  const [routingIndex, setRoutingIndex] = useState(0);

  // Evaluator-Optimizer interactive states
  const [evalStep, setEvalStep] = useState<number>(1);
  const [isApproved, setIsApproved] = useState(false);

  const active = patterns.find((p) => p.id === selectedPattern) ?? patterns[0];
  const activeRoute = routingExamples[routingIndex];

  const handleNextEvalStep = () => {
    if (evalStep === 1) {
      setEvalStep(2);
    } else if (evalStep === 2) {
      setEvalStep(3);
      setIsApproved(true);
    } else {
      setEvalStep(1);
      setIsApproved(false);
    }
  };

  return (
    <figure className="diagram workflow-simulator" aria-label="Workflow Patterns Simulator">
      <div className="workflow-header">
        <div className="workflow-title-row">
          <GitBranch size={18} className="workflow-icon" aria-hidden="true" />
          <h3 className="workflow-title">Mô phỏng Trực quan: Các Mẫu Thiết kế Workflow</h3>
        </div>
        <p className="workflow-intro">{intro}</p>
      </div>

      {/* Pattern Selector Tabs */}
      <div className="workflow-tabs" role="tablist" aria-label="Workflow Pattern Tabs">
        {patterns.map((pattern) => (
          <button
            key={pattern.id}
            type="button"
            role="tab"
            aria-selected={selectedPattern === pattern.id}
            className={`workflow-tab ${selectedPattern === pattern.id ? "workflow-tab--active" : ""}`}
            onClick={() => {
              setSelectedPattern(pattern.id);
              setEvalStep(1);
              setIsApproved(false);
            }}
          >
            <span>{pattern.name}</span>
          </button>
        ))}
      </div>

      {/* Pattern Info Card */}
      <div className="workflow-pattern-info">
        <div className="workflow-pattern-header">
          <span className="badge badge--ok">{active.badge}</span>
          <span className="workflow-best-for">
            <strong>Phù hợp nhất:</strong> {active.bestFor}
          </span>
        </div>
        <p className="workflow-summary">{active.summary}</p>
      </div>

      {/* Interactive Canvas Area */}
      <div className="workflow-canvas" aria-live="polite">
        {selectedPattern === "routing" && (
          <div className="workflow-stage workflow-stage--routing">
            <div className="workflow-interactive-bar">
              <span className="workflow-interactive-label">Chọn câu hỏi người dùng mẫu:</span>
              <div className="workflow-btn-group" role="group" aria-label="Routing query examples">
                {routingExamples.map((ex, idx) => (
                  <button
                    key={ex.intent}
                    type="button"
                    className={`button button--sm ${routingIndex === idx ? "button--primary" : "button--secondary"}`}
                    onClick={() => setRoutingIndex(idx)}
                    aria-pressed={routingIndex === idx}
                  >
                    Mẫu {idx + 1}: {ex.intent}
                  </button>
                ))}
              </div>
            </div>

            <div className="workflow-flow-diagram">
              <div className="flow-node flow-node--input">
                <span className="flow-node-badge">User Query</span>
                <p className="flow-node-text">{activeRoute.query}</p>
              </div>

              <div className="flow-arrow" aria-hidden="true">
                <ArrowRight size={20} />
                <span className="flow-arrow-text">Haiku Router</span>
              </div>

              <div className="flow-node flow-node--decision">
                <span className="flow-node-badge">Intent Phân loại</span>
                <strong>{activeRoute.intent}</strong>
                <span className="flow-node-sub">Mức độ rủi ro: {activeRoute.risk}</span>
              </div>

              <div className="flow-arrow" aria-hidden="true">
                <ArrowRight size={20} />
                <span className="flow-arrow-text">Dispatch</span>
              </div>

              <div
                className={`flow-node flow-node--target ${
                  activeRoute.risk === "Rất cao" ? "flow-node--checkpoint" : ""
                }`}
              >
                <span className="flow-node-badge">Handler Thực thi</span>
                <strong>{activeRoute.target}</strong>
                <span className="flow-node-sub">Ước tính chi phí: {activeRoute.cost}</span>
              </div>
            </div>
          </div>
        )}

        {selectedPattern === "evaluator-optimizer" && (
          <div className="workflow-stage workflow-stage--loop">
            <div className="workflow-interactive-bar">
              <span className="workflow-interactive-label">
                Vòng lặp hiện tại: <strong>Lượt {evalStep} / 3</strong>
              </span>
              <button
                type="button"
                className="button button--primary button--sm"
                onClick={handleNextEvalStep}
              >
                <RefreshCw size={14} className={evalStep === 1 ? "" : "spin-subtle"} aria-hidden="true" />
                {evalStep === 1
                  ? "Chạy Kiểm định Lần 1 (Fail rubric)"
                  : evalStep === 2
                    ? "Tối ưu & Chạy Lần 2 (Pass rubric)"
                    : "Khởi động lại mô phỏng"}
              </button>
            </div>

            <div className="workflow-loop-diagram">
              <div className="flow-node flow-node--generator">
                <span className="flow-node-badge">Generator LLM</span>
                <strong>
                  {evalStep === 1
                    ? "Bản nháp 1 (Chưa có citation nguồn)"
                    : "Bản nháp 2 (Đã bổ sung đầy đủ dẫn chứng và trích dẫn)"}
                </strong>
                <span className="flow-node-sub">Sinh bởi Claude 3.5 Sonnet</span>
              </div>

              <div className="flow-arrow" aria-hidden="true">
                <ArrowRight size={20} />
                <span className="flow-arrow-text">Gửi bản nháp</span>
              </div>

              <div
                className={`flow-node flow-node--evaluator ${
                  evalStep === 1 ? "flow-node--fail" : "flow-node--pass"
                }`}
              >
                <span className="flow-node-badge">Evaluator Rubric</span>
                {evalStep === 1 ? (
                  <>
                    <strong className="text-warn">Không đạt (5/10)</strong>
                    <span className="flow-node-sub">Lỗi: Thiếu số liệu quý 3 và citation</span>
                  </>
                ) : (
                  <>
                    <strong className="text-ok">Đạt tiêu chuẩn (9.5/10)</strong>
                    <span className="flow-node-sub">Tất cả tiêu chí nghiệm thu được thỏa mãn</span>
                  </>
                )}
              </div>

              <div className="flow-arrow" aria-hidden="true">
                <ArrowRight size={20} />
                <span className="flow-arrow-text">
                  {evalStep === 1 ? "Yêu cầu sửa" : "Bàn giao kiểm duyệt"}
                </span>
              </div>

              <div
                className={`flow-node flow-node--checkpoint ${
                  isApproved ? "flow-node--approved" : ""
                }`}
              >
                <span className="flow-node-badge">
                  <UserCheck size={12} aria-hidden="true" /> Human Checkpoint
                </span>
                {isApproved ? (
                  <>
                    <strong className="text-ok">
                      <CheckCircle2 size={16} aria-hidden="true" /> Đã Phê Duyệt Phát Hành
                    </strong>
                    <span className="flow-node-sub">Chuyên viên đã ký duyệt xuất bản</span>
                  </>
                ) : (
                  <>
                    <strong>Chờ thẩm định</strong>
                    <span className="flow-node-sub">Con người giữ quyết định phát hành cuối</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedPattern === "parallelization" && (
          <div className="workflow-stage workflow-stage--parallel">
            <div className="flow-parallel-container">
              <div className="flow-node flow-node--input">
                <span className="flow-node-badge">Input Hợp Đồng</span>
                <strong>Hợp đồng sáp nhập doanh nghiệp (120 trang)</strong>
              </div>

              <div className="flow-parallel-branches">
                <div className="flow-branch-node">
                  <span className="flow-node-badge">Nhánh 1: Rà soát Pháp lý</span>
                  <span>Claude 3.5 Sonnet (Kiểm tra điều khoản cam kết)</span>
                  <span className="badge badge--sm">Độ trễ: 3.2s</span>
                </div>
                <div className="flow-branch-node">
                  <span className="flow-node-badge">Nhánh 2: Thẩm định Tài chính</span>
                  <span>Claude 3.5 Sonnet (Kiểm tra nợ tồn đọng & định giá)</span>
                  <span className="badge badge--sm">Độ trễ: 2.8s</span>
                </div>
                <div className="flow-branch-node">
                  <span className="flow-node-badge">Nhánh 3: Đảm bảo Bảo mật</span>
                  <span>Claude 3.5 Haiku (Kiểm tra dữ liệu cá nhân GDPR)</span>
                  <span className="badge badge--sm">Độ trễ: 1.1s</span>
                </div>
              </div>

              <div className="flow-node flow-node--aggregator">
                <span className="flow-node-badge">Aggregator (Tổng hợp)</span>
                <strong>Báo cáo rủi ro hợp nhất toàn diện</strong>
                <span className="flow-node-sub">
                  Tổng thời gian: <strong>3.2s</strong> (chạy song song) thay vì <strong>7.1s</strong> (nếu chạy tuần tự)
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedPattern === "orchestrator-workers" && (
          <div className="workflow-stage workflow-stage--orchestrator">
            <div className="flow-orchestrator-container">
              <div className="flow-node flow-node--orchestrator">
                <span className="flow-node-badge">
                  <Sparkles size={12} aria-hidden="true" /> Lead Orchestrator
                </span>
                <strong>Phân rã mục tiêu: Phân tích chiến lược đối thủ 2026</strong>
                <span className="flow-node-sub">Tự động sinh 3 nhiệm vụ độc lập cho các Worker</span>
              </div>

              <div className="flow-workers-grid">
                <div className="flow-worker-card">
                  <span className="flow-node-badge">Worker A</span>
                  <strong>Web Search Connector</strong>
                  <p>Thu thập thông cáo báo chí và sản phẩm mới vừa ra mắt</p>
                </div>
                <div className="flow-worker-card">
                  <span className="flow-node-badge">Worker B</span>
                  <strong>Financial Doc Parser</strong>
                  <p>Trích xuất báo cáo tài chính quý gần nhất từ SEC EDGAR</p>
                </div>
                <div className="flow-worker-card">
                  <span className="flow-node-badge">Worker C</span>
                  <strong>Patent Database Query</strong>
                  <p>Tra cứu các bằng sáng chế AI mới được nộp trong 6 tháng qua</p>
                </div>
              </div>

              <div className="flow-node flow-node--target">
                <span className="flow-node-badge">Synthesis & Review</span>
                <strong>Bản báo cáo tình báo cạnh tranh tổng hợp kèm trích dẫn nguồn</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exam Takeaway Footer */}
      <div className="workflow-takeaway">
        <div className="workflow-takeaway-head">
          <ShieldAlert size={14} aria-hidden="true" />
          <strong>Ghi nhớ cốt lõi cho kỳ thi CCAO-F (Domain 4)</strong>
        </div>
        <p>{active.examTakeaway}</p>
      </div>
    </figure>
  );
}
