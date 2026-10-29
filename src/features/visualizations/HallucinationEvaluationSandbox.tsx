import { useState } from "react";
import {
  CheckCircle2,
  FileCheck,
  FileText,
  HelpCircle,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";

export type DefectType =
  | "factual-hallucination"
  | "internal-inconsistency"
  | "fabricated-citation"
  | "missing-constraint"
  | "verified-accurate";

export interface AuditClaim {
  id: string;
  claimText: string;
  location: string;
  actualDefect: DefectType;
  explanation: string;
  remediationAdvice: string;
}

export interface SandboxScenario {
  id: string;
  title: string;
  domainContext: string;
  riskLevel: "High" | "Critical" | "Medium";
  groundTruthDoc: {
    sourceName: string;
    content: string;
  };
  generatedOutput: {
    title: string;
    content: string;
  };
  claims: AuditClaim[];
  examTakeaway: string;
}

const DEFECT_LABELS: Record<DefectType, { label: string; tone: "ok" | "warn" | "neutral" | "accent" }> = {
  "factual-hallucination": { label: "Factual Hallucination (Bịa đặt sự thật)", tone: "warn" },
  "internal-inconsistency": { label: "Internal Inconsistency (Mâu thuẫn nội tại)", tone: "warn" },
  "fabricated-citation": { label: "Fabricated Citation (Trích dẫn giả mạo)", tone: "warn" },
  "missing-constraint": { label: "Missing Constraint (Bỏ sót ràng buộc)", tone: "warn" },
  "verified-accurate": { label: "Verified Accurate (Chính xác)", tone: "ok" },
};

const SCENARIOS: SandboxScenario[] = [
  {
    id: "finance-q3",
    title: "Tình huống 1: Báo cáo Tài chính Q3 & Số liệu Doanh thu",
    domainContext: "Phân tích tài chính doanh nghiệp",
    riskLevel: "Critical",
    groundTruthDoc: {
      sourceName: "Báo cáo Kiểm toán Nội bộ Q3-2026 (Trang 14)",
      content:
        "Tổng doanh thu thuần Q3 đạt $120M, tăng trưởng 5% YoY. Chi phí vận hành gia tăng đột biến do mở rộng hạ tầng khiến biên lợi nhuận hoạt động (operating margin) bị co hẹp 1.8% trên toàn bộ 4 khu vực kinh doanh. Lợi nhuận ròng sau thuế đạt chính xác $14M.",
    },
    generatedOutput: {
      title: "Bản tóm lược điều hành (Executive Summary do Claude tạo)",
      content:
        "[1] Quý 3 ghi nhận kết quả kinh doanh vượt bậc với tổng doanh thu thuần $120M và biên lợi nhuận hoạt động mở rộng 3.2% trên toàn hệ thống.\n\n[2] Tuy nhiên, tại bảng phân tích chi tiết khu vực, biên lợi nhuận hoạt động bị co hẹp đồng loạt tại cả 4 khu vực kinh doanh do chi phí tăng cao.\n\n[3] Lợi nhuận ròng sau thuế dự kiến đạt $40M nhờ các biện pháp cắt giảm chi phí vận hành triệt để.",
    },
    claims: [
      {
        id: "claim-1",
        claimText: "[1] Biên lợi nhuận hoạt động mở rộng 3.2% trên toàn hệ thống",
        location: "Đoạn 1 - Executive Summary",
        actualDefect: "internal-inconsistency",
        explanation:
          "Mâu thuẫn nội tại (Internal Inconsistency): Đoạn 1 tuyên bố biên lợi nhuận 'mở rộng 3.2%', nhưng ngay tại Đoạn 2 lại ghi biên lợi nhuận 'bị co hẹp đồng loạt tại cả 4 khu vực'. Hai phần trong cùng một văn bản trực tiếp phủ định lẫn nhau.",
        remediationAdvice:
          "Yêu cầu Claude trích dẫn số liệu từ bảng nguồn trước khi đưa ra nhận định tổng quan; đối chiếu chéo số liệu giữa phần tóm tắt và phần chi tiết.",
      },
      {
        id: "claim-2",
        claimText: "[2] Biên lợi nhuận bị co hẹp đồng loạt tại cả 4 khu vực",
        location: "Đoạn 2 - Phân tích khu vực",
        actualDefect: "verified-accurate",
        explanation:
          "Chính xác (Verified Accurate): Khớp hoàn toàn với tài liệu nguồn: 'biên lợi nhuận hoạt động bị co hẹp 1.8% trên toàn bộ 4 khu vực kinh doanh'.",
        remediationAdvice:
          "Giữ nguyên nội dung và bổ sung thêm con số định lượng chính xác (1.8%) từ nguồn để tăng tính chặt chẽ.",
      },
      {
        id: "claim-3",
        claimText: "[3] Lợi nhuận ròng sau thuế dự kiến đạt $40M nhờ chi phí vận hành giảm",
        location: "Đoạn 3 - Lợi nhuận ròng",
        actualDefect: "factual-hallucination",
        explanation:
          "Bịa đặt sự thật (Factual Hallucination): Nguồn gốc xác nhận lợi nhuận ròng là '$14M' và 'chi phí gia tăng đột biến', nhưng mô hình đã tự ý phóng đại thành '$40M' và bịa đặt lý do 'chi phí vận hành giảm triệt để'.",
        remediationAdvice:
          "Sử dụng kỹ thuật 'Grounding with Direct Quotes': buộc Claude phải trích dẫn nguyên văn số liệu từ tài liệu nguồn trước khi viết câu kết luận.",
      },
    ],
    examTakeaway:
      "Trong Domain 2 CCAO-F, thí sinh phải phân biệt rõ: Factual Hallucination là thông tin sai lệch so với nguồn bên ngoài, còn Internal Inconsistency là sự mâu thuẫn giữa các phần trong chính văn bản output. Hai câu trả lời nghe trôi chảy vẫn có thể hoàn toàn sai số liệu.",
  },
  {
    id: "legal-nda",
    title: "Tình huống 2: Thỏa thuận Bảo mật NDA & Quyền Dữ liệu",
    domainContext: "Rà soát điều khoản pháp lý doanh nghiệp",
    riskLevel: "High",
    groundTruthDoc: {
      sourceName: "Hợp đồng Bảo mật Thông tin NDA-2026 (Điều 4.2)",
      content:
        "Bên Nhận chỉ được phép tiết lộ thông tin mật cho nhân sự trực tiếp tham gia dự án đã ký cam kết bảo mật bằng văn bản. Mọi dữ liệu tài chính của Bên Tiết Lộ tuyệt đối không được sao chép hoặc chuyển giao ra ngoài lãnh thổ Liên minh Châu Âu (EU) khi chưa có sự chấp thuận trước bằng văn bản của Hội đồng Quản trị.",
    },
    generatedOutput: {
      title: "Bản tóm tắt pháp lý cho đội ngũ kỹ thuật",
      content:
        "[1] Bên Nhận được phép chia sẻ tự do tài liệu mật cho các nhà thầu phụ trợ bên ngoài để đẩy nhanh tiến độ dự án mà không cần thỏa thuận bổ sung.\n\n[2] Việc chuyển giao dữ liệu tài chính xuyên biên giới ra ngoài EU được miễn trừ phê duyệt theo Điều 12 của Đạo luật Bảo mật Quốc tế (IPA 2024).\n\n[3] Nhân sự nội bộ tiếp cận tài liệu phải là người tham gia dự án và đã ký cam kết bảo mật bằng văn bản.",
    },
    claims: [
      {
        id: "claim-1",
        claimText: "[1] Được phép chia sẻ tự do tài liệu mật cho nhà thầu phụ trợ bên ngoài",
        location: "Mục 1 - Quyền chia sẻ tài liệu",
        actualDefect: "missing-constraint",
        explanation:
          "Bỏ sót ràng buộc then chốt (Missing Critical Constraint): Hợp đồng gốc giới hạn nghiêm ngặt 'chỉ cho nhân sự trực tiếp tham gia dự án đã ký cam kết'. Output đã tự ý mở rộng quyền hạn cho 'nhà thầu phụ trợ bên ngoài', gây rủi ro vi phạm hợp đồng nghiêm trọng.",
        remediationAdvice:
          "Bổ sung chỉ dẫn System Prompt: 'Liệt kê mọi điều kiện hạn chế và phạm vi loại trừ; tuyệt đối không mở rộng quyền hạn khi văn bản gốc không cho phép'.",
      },
      {
        id: "claim-2",
        claimText: "[2] Miễn trừ phê duyệt theo Điều 12 của Đạo luật Bảo mật Quốc tế (IPA 2024)",
        location: "Mục 2 - Chuyển giao dữ liệu ngoài EU",
        actualDefect: "fabricated-citation",
        explanation:
          "Trích dẫn giả mạo (Fabricated Citation / False Authority): 'Điều 12 của Đạo luật Bảo mật Quốc tế (IPA 2024)' là điều luật hoàn toàn bịa đặt do mô hình tự nghĩ ra để tạo cảm giác uy quyền giả tạo, trong khi hợp đồng gốc cấm hoàn toàn nếu không có phê duyệt bằng văn bản của HĐQT.",
        remediationAdvice:
          "Áp dụng nguyên tắc Fact-Check của Anthropic: Kiểm tra từng trích dẫn luật/quy chuẩn; nếu không có trong cơ sở dữ liệu xác thực, lập tức thu hồi và loại bỏ claim.",
      },
      {
        id: "claim-3",
        claimText: "[3] Nhân sự nội bộ tiếp cận tài liệu phải tham gia dự án và đã ký cam kết",
        location: "Mục 3 - Điều kiện nhân sự",
        actualDefect: "verified-accurate",
        explanation:
          "Chính xác (Verified Accurate): Phản ánh đúng 100% tinh thần và câu chữ của Điều 4.2 trong hợp đồng gốc.",
        remediationAdvice: "Giữ nguyên claim này.",
      },
    ],
    examTakeaway:
      "Anthropic cảnh báo mô hình có thể tạo ra các trích dẫn luật, số điều khoản hoặc nguồn học thuật giả mạo có vẻ rất thật (Fabricated Authority). Trong các trường hợp pháp lý (High-Stakes), bắt buộc phải có Qualified Human Review để đối chiếu nguồn gốc.",
  },
  {
    id: "healthcare-dosage",
    title: "Tình huống 3: Hướng dẫn Kê đơn & An toàn Dược phẩm",
    domainContext: "Tư vấn thông tin y tế chuyên môn",
    riskLevel: "Critical",
    groundTruthDoc: {
      sourceName: "Dược thư Quốc gia: Hướng dẫn Kê đơn Hoạt chất Analgesic-X (Mục 3)",
      content:
        "Chỉ định: Giảm đau cấp tính mức độ vừa đến nặng. Liều khởi đầu khuyến cáo cho người lớn: 10mg mỗi 12 giờ (tối đa 20mg/ngày). Chống chỉ định tuyệt đối: Phụ nữ mang thai 3 tháng đầu và bệnh nhân suy gan giai đoạn cuối. Thuốc thuộc danh mục kê đơn bắt buộc (Rx Only); mọi điều chỉnh liều phải do bác sĩ chuyên khoa chỉ định.",
    },
    generatedOutput: {
      title: "Lời khuyên sử dụng thuốc cho người bệnh",
      content:
        "[1] Hoạt chất Analgesic-X dùng để điều trị các cơn đau cấp tính mức độ vừa đến nặng ở người lớn.\n\n[2] Người bệnh có thể uống 40mg mỗi 4 giờ khi cảm thấy đau nhiều để dứt cơn đau nhanh chóng mà không cần tái khám.\n\n[3] Thuốc hoàn toàn lành tính và có thể dùng an toàn cho phụ nữ mang thai trong những tháng đầu tiên.",
    },
    claims: [
      {
        id: "claim-1",
        claimText: "[1] Dùng để điều trị các cơn đau cấp tính mức độ vừa đến nặng ở người lớn",
        location: "Chỉ định điều trị",
        actualDefect: "verified-accurate",
        explanation: "Chính xác (Verified Accurate): Khớp với chỉ định trong Dược thư Quốc gia.",
        remediationAdvice: "Giữ nguyên thông tin chỉ định.",
      },
      {
        id: "claim-2",
        claimText: "[2] Uống 40mg mỗi 4 giờ mà không cần tái khám",
        location: "Liều lượng sử dụng",
        actualDefect: "factual-hallucination",
        explanation:
          "Bịa đặt liều lượng đe dọa tính mạng (Lethal Dosage Hallucination): 40mg mỗi 4 giờ tương đương 240mg/ngày, vượt gấp 12 lần liều tối đa cho phép (20mg/ngày). Đây là lỗi hallucination ở mức độ nguy hại cao nhất trong y tế.",
        remediationAdvice:
          "Thiết lập Guardrails cứng: Tuyệt đối không cho phép AI tự động sinh lời khuyên kê đơn liều lượng cho bệnh nhân mà không qua kiểm duyệt của chuyên gia y tế (Human-in-the-loop).",
      },
      {
        id: "claim-3",
        claimText: "[3] Hoàn toàn lành tính và có thể dùng an toàn cho phụ nữ mang thai 3 tháng đầu",
        location: "Chống chỉ định",
        actualDefect: "factual-hallucination",
        explanation:
          "Bịa đặt trái ngược chống chỉ định tuyệt đối: Nguồn gốc ghi rõ 'Chống chỉ định tuyệt đối cho phụ nữ mang thai 3 tháng đầu', nhưng mô hình lại khẳng định 'hoàn toàn lành tính và an toàn'.",
        remediationAdvice:
          "Cấu hình Rubric đánh giá nhị phân nghiêm ngặt (Binary Pass/Fail): Bất kỳ sai lệch nào về chống chỉ định y tế đều bị chấm điểm 0 và kích hoạt cảnh báo an toàn hệ thống.",
      },
    ],
    examTakeaway:
      "Các tác vụ y tế, tài chính, pháp lý được xếp vào nhóm 'High-Risk Decisions' theo Anthropic Usage Policy. Bất kể prompt được tối ưu đến đâu, con người có chuyên môn (Qualified Human Reviewer) bắt buộc phải phê duyệt quyết định cuối cùng.",
  },
];

export function HallucinationEvaluationSandbox({ intro }: { intro?: string }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SCENARIOS[0]!.id);
  const [userAssessments, setUserAssessments] = useState<Record<string, DefectType>>({});
  const [showVerification, setShowVerification] = useState<boolean>(false);

  const scenario = SCENARIOS.find((s) => s.id === selectedScenarioId) ?? SCENARIOS[0]!;

  const handleSelectScenario = (newId: string) => {
    setSelectedScenarioId(newId);
    setUserAssessments({});
    setShowVerification(false);
  };

  const handleClassifyClaim = (claimId: string, defect: DefectType) => {
    setUserAssessments((prev) => ({
      ...prev,
      [claimId]: defect,
    }));
  };

  const handleReset = () => {
    setUserAssessments({});
    setShowVerification(false);
  };

  const answeredCount = Object.keys(userAssessments).length;
  const totalClaims = scenario.claims.length;
  const allAnswered = answeredCount === totalClaims;

  let correctCount = 0;
  if (showVerification) {
    for (const claim of scenario.claims) {
      if (userAssessments[claim.id] === claim.actualDefect) {
        correctCount += 1;
      }
    }
  }

  return (
    <figure
      className="hallucination-sandbox"
      aria-label="Bàn Thử Nghiệm Tương Tác: Phát hiện Hallucination & Thẩm Định Output"
    >
      {intro ? <p className="diagram-intro">{intro}</p> : null}

      <div className="sandbox-container">
        {/* Main Title */}
        <div className="sandbox-header">
          <div className="sandbox-header-main">
            <Search size={20} className="text-accent" aria-hidden="true" />
            <div>
              <h3 className="sandbox-title">
                Bàn Thử Nghiệm Tương Tác: Nhận Diện Hallucination & Thẩm Định Output
              </h3>
              <span className="sandbox-subtitle">
                Đóng vai trò Chuyên viên Đánh giá (Evaluator) theo chuẩn kỳ thi CCAO-F (Domain 2: 21% trọng số)
              </span>
            </div>
          </div>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="sandbox-scenario-tabs" role="group" aria-label="Chọn kịch bản thẩm định">
          {SCENARIOS.map((s) => {
            const isSelected = s.id === selectedScenarioId;
            return (
              <button
                key={s.id}
                type="button"
                className={`sandbox-tab-btn ${isSelected ? "sandbox-tab-btn--active" : ""}`}
                aria-pressed={isSelected}
                onClick={() => handleSelectScenario(s.id)}
              >
                <div className="sandbox-tab-title">{s.title}</div>
                <div className="sandbox-tab-meta">
                  <span>{s.domainContext}</span>
                  <Badge tone={s.riskLevel === "Critical" ? "warn" : "accent"}>{s.riskLevel} Risk</Badge>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dual Pane: Ground Truth Document vs Claude Generated Output */}
        <div className="sandbox-dual-grid">
          {/* Ground Truth Document */}
          <div className="sandbox-doc-pane sandbox-doc-pane--source">
            <div className="sandbox-pane-head">
              <FileCheck size={16} className="text-ok" aria-hidden="true" />
              <h4 className="sandbox-pane-title">Tài liệu Nguồn Xác thực (Ground Truth Context)</h4>
            </div>
            <div className="sandbox-source-badge">{scenario.groundTruthDoc.sourceName}</div>
            <div className="sandbox-pane-body">
              <blockquote className="sandbox-doc-quote">{scenario.groundTruthDoc.content}</blockquote>
            </div>
          </div>

          {/* Claude Generated Output to Audit */}
          <div className="sandbox-doc-pane sandbox-doc-pane--generated">
            <div className="sandbox-pane-head">
              <FileText size={16} className="text-accent" aria-hidden="true" />
              <h4 className="sandbox-pane-title">Văn bản do Claude tạo ra (Output cần Thẩm định)</h4>
            </div>
            <div className="sandbox-source-badge">{scenario.generatedOutput.title}</div>
            <div className="sandbox-pane-body">
              <pre className="sandbox-generated-pre">{scenario.generatedOutput.content}</pre>
            </div>
          </div>
        </div>

        {/* Claims Audit Section */}
        <div className="sandbox-audit-section">
          <div className="sandbox-section-head">
            <h4 className="sandbox-section-title">
              Nhiệm vụ Thẩm định: Phân loại từng Claim dưới đây theo Tiêu chuẩn Anthropic
            </h4>
            <span className="sandbox-progress-pill">
              Đã đánh giá: {answeredCount} / {totalClaims} claims
            </span>
          </div>

          <div className="sandbox-claims-list">
            {scenario.claims.map((claim) => {
              const userSelection = userAssessments[claim.id];
              const isCorrect = userSelection === claim.actualDefect;

              return (
                <div
                  key={claim.id}
                  className={`sandbox-claim-card ${
                    showVerification
                      ? isCorrect
                        ? "sandbox-claim--correct"
                        : "sandbox-claim--incorrect"
                      : userSelection
                        ? "sandbox-claim--answered"
                        : ""
                  }`}
                >
                  <div className="sandbox-claim-top">
                    <div>
                      <span className="sandbox-claim-loc">{claim.location}</span>
                      <p className="sandbox-claim-text">{claim.claimText}</p>
                    </div>
                    {showVerification ? (
                      <Badge tone={isCorrect ? "ok" : "warn"}>
                        {isCorrect ? "Đánh giá đúng" : "Chưa chính xác"}
                      </Badge>
                    ) : null}
                  </div>

                  {/* Defect Options Selector */}
                  <div className="sandbox-options-row">
                    <span className="sandbox-options-label">Phân loại lỗi:</span>
                    <div className="sandbox-options-pills" role="group" aria-label={`Phân loại ${claim.id}`}>
                      {(
                        [
                          "verified-accurate",
                          "factual-hallucination",
                          "internal-inconsistency",
                          "fabricated-citation",
                          "missing-constraint",
                        ] as DefectType[]
                      ).map((defect) => {
                        const isChosen = userSelection === defect;
                        return (
                          <button
                            key={defect}
                            type="button"
                            className={`sandbox-option-btn ${isChosen ? "sandbox-option-btn--active" : ""}`}
                            aria-pressed={isChosen}
                            onClick={() => handleClassifyClaim(claim.id, defect)}
                          >
                            {DEFECT_LABELS[defect].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Verification Feedback Details */}
                  {showVerification ? (
                    <div className="sandbox-feedback-box">
                      <div className="sandbox-feedback-head">
                        <strong>Đáp án chuẩn xác:</strong>{" "}
                        <span className="text-accent font-semibold">{DEFECT_LABELS[claim.actualDefect].label}</span>
                      </div>
                      <p className="sandbox-feedback-exp">{claim.explanation}</p>
                      <div className="sandbox-feedback-advice">
                        <Sparkles size={14} className="text-accent" aria-hidden="true" />
                        <span>
                          <strong>Cách khắc phục (Anthropic Best Practice):</strong> {claim.remediationAdvice}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="sandbox-action-bar">
            {!showVerification ? (
              <button
                type="button"
                className="btn btn--primary"
                disabled={!allAnswered}
                onClick={() => setShowVerification(true)}
              >
                <CheckCircle2 size={16} strokeWidth={2} aria-hidden="true" />
                <span>Kiểm định & Đối chiếu Rubric Anthropic ({answeredCount}/{totalClaims})</span>
              </button>
            ) : (
              <div className="sandbox-results-bar">
                <div className="sandbox-score-summary">
                  <span className="sandbox-score-text">
                    Kết quả thẩm định của bạn: <strong>{correctCount} / {totalClaims}</strong> claims chính xác (
                    {Math.round((correctCount / totalClaims) * 100)}%)
                  </span>
                </div>
                <button type="button" className="btn btn--outline" onClick={handleReset}>
                  <RotateCcw size={15} strokeWidth={2} aria-hidden="true" />
                  <span>Thử lại kịch bản này</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Exam Takeaway Card */}
        <div className="workflow-takeaway" style={{ marginTop: "var(--space-4)" }}>
          <div className="workflow-takeaway-head">
            <HelpCircle size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>Điểm mấu chốt cho kỳ thi CCAO-F (Domain 2)</span>
          </div>
          <p className="workflow-takeaway-body">{scenario.examTakeaway}</p>
        </div>
      </div>
    </figure>
  );
}
