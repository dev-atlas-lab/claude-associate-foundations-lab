import { useState } from "react";
import { Check, Code2, Eye, Layers, ShieldCheck, Sparkles, Terminal } from "lucide-react";

interface LayerItem {
  id: string;
  name: string;
  category: string;
  description: string;
  codeSnippet: string;
  clarityBoost: number;
  hallucinationReduction: number;
  parsabilityScore: number;
  examNote: string;
}

const availableLayers: LayerItem[] = [
  {
    id: "role",
    name: "1. Role & System Persona",
    category: "Định vị vai trò",
    description: "Xác lập góc nhìn, thẩm quyền chuyên môn và giọng điệu phản hồi của Claude.",
    codeSnippet: `You are an expert enterprise compliance auditor at a tier-1 financial institution.
Your objective is to review operational procedures against regulatory guidelines with high rigor.`,
    clarityBoost: 20,
    hallucinationReduction: 15,
    parsabilityScore: 10,
    examNote: "System prompt xác lập bối cảnh nền tảng và nên giữ ổn định xuyên suốt các lượt gọi.",
  },
  {
    id: "xml",
    name: "2. XML Structured Delimiters",
    category: "Phân tách ngữ cảnh",
    description: "Dùng các thẻ XML (<context>, <guidelines>, <documents>) để phân định ranh giới dữ liệu.",
    codeSnippet: `<context>
  <policy_document id="POL-2026-A">
    All customer data transfers outside the APAC region require prior DPO approval.
  </policy_document>
</context>`,
    clarityBoost: 25,
    hallucinationReduction: 30,
    parsabilityScore: 25,
    examNote: "Anthropic khuyến nghị dùng XML tags để ngăn ngừa prompt injection và chống nhầm lẫn dữ liệu với chỉ dẫn.",
  },
  {
    id: "rubric",
    name: "3. Acceptance Criteria & Rubric",
    category: "Tiêu chí nghiệm thu",
    description: "Liệt kê rõ ràng điều kiện Đạt / Không đạt và cách xử lý khi dữ liệu không đầy đủ.",
    codeSnippet: `<acceptance_criteria>
  1. Explicitly cite the policy ID for each finding.
  2. If evidence is insufficient, state "INSUFFICIENT_EVIDENCE" — do not guess or extrapolate.
  3. Classify risk level strictly into: LOW, MEDIUM, HIGH, or CRITICAL.
</acceptance_criteria>`,
    clarityBoost: 25,
    hallucinationReduction: 35,
    parsabilityScore: 25,
    examNote: "Yêu cầu Claude nói 'tôi không biết' hoặc 'không đủ dữ liệu' là kỹ thuật hàng đầu chống hallucination.",
  },
  {
    id: "few-shot",
    name: "4. Few-Shot Exemplars",
    category: "Ví dụ mẫu chuẩn",
    description: "Cung cấp 1-3 cặp Input/Output mẫu đa dạng để định hình cấu trúc và phong cách trả lời.",
    codeSnippet: `<examples>
  <example>
    <input>Data transferred to US cloud without sign-off.</input>
    <output>{"risk": "HIGH", "policy": "POL-2026-A", "action": "HALT_TRANSFER"}</output>
  </example>
</examples>`,
    clarityBoost: 20,
    hallucinationReduction: 15,
    parsabilityScore: 25,
    examNote: "Ví dụ mẫu là cách trực quan và ổn định nhất để model tuân thủ định dạng phức tạp.",
  },
  {
    id: "prefill",
    name: "5. Output Prefill / Assistant Prefill",
    category: "Khóa định dạng đầu ra",
    description: "Khởi đầu tin nhắn của Assistant bằng ký tự mở đầu (ví dụ: { hoặc <audit_report>) để bắt buộc định dạng.",
    codeSnippet: `// Assistant message prefill:
{
  "audit_status": "COMPLETED",
  "findings": [`,
    clarityBoost: 10,
    hallucinationReduction: 5,
    parsabilityScore: 15,
    examNote: "Prefill ở tin nhắn assistant ép model tiếp tục đúng cú pháp JSON/XML mà không sinh lời mở đầu rườm rà.",
  },
];

export function PromptLayeringWorkbench({ intro }: { intro: string }) {
  const [activeLayerIds, setActiveLayerIds] = useState<string[]>([
    "role",
    "xml",
    "rubric",
  ]);
  const [showFullCode, setShowFullCode] = useState(false);

  const toggleLayer = (id: string) => {
    setActiveLayerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setActiveLayerIds(availableLayers.map((l) => l.id));
  };

  const resetLayers = () => {
    setActiveLayerIds(["role"]);
  };

  // Metrics calculations
  const totalClarity = Math.min(
    100,
    activeLayerIds.reduce((sum, id) => {
      const l = availableLayers.find((item) => item.id === id);
      return sum + (l ? l.clarityBoost : 0);
    }, 0)
  );

  const totalHallucinationResistance = Math.min(
    100,
    activeLayerIds.reduce((sum, id) => {
      const l = availableLayers.find((item) => item.id === id);
      return sum + (l ? l.hallucinationReduction : 0);
    }, 0)
  );

  const totalParsability = Math.min(
    100,
    activeLayerIds.reduce((sum, id) => {
      const l = availableLayers.find((item) => item.id === id);
      return sum + (l ? l.parsabilityScore : 0);
    }, 0)
  );

  const assembledPrompt = availableLayers
    .filter((l) => activeLayerIds.includes(l.id))
    .map((l) => l.codeSnippet)
    .join("\n\n");

  return (
    <figure className="diagram prompt-workbench" aria-label="Prompt Layering Workbench">
      <div className="wb-header">
        <div className="wb-title-row">
          <Layers size={18} className="wb-icon" aria-hidden="true" />
          <h3 className="wb-title">Bàn Thử Nghiệm: Cấu Trúc Đa Lớp Prompt Chuẩn Anthropic</h3>
        </div>
        <p className="wb-intro">{intro}</p>
      </div>

      {/* Layer Toggles */}
      <div className="wb-controls" role="group" aria-label="Prompt Layers">
        <div className="wb-controls-header">
          <span className="wb-controls-title">Bật / Tắt các lớp cấu trúc:</span>
          <div className="wb-actions">
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={selectAll}
            >
              Kích hoạt tất cả (Full Stack)
            </button>
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={resetLayers}
            >
              Khởi tạo lại
            </button>
          </div>
        </div>

        <div className="wb-layers-grid">
          {availableLayers.map((layer) => {
            const isChecked = activeLayerIds.includes(layer.id);
            return (
              <button
                key={layer.id}
                type="button"
                className={`wb-layer-card ${isChecked ? "wb-layer-card--active" : ""}`}
                onClick={() => toggleLayer(layer.id)}
                aria-pressed={isChecked}
              >
                <div className="wb-layer-card-top">
                  <div className={`wb-checkbox ${isChecked ? "wb-checkbox--checked" : ""}`}>
                    {isChecked && <Check size={12} strokeWidth={3} aria-hidden="true" />}
                  </div>
                  <strong className="wb-layer-name">{layer.name}</strong>
                  <span className="badge badge--sm">{layer.category}</span>
                </div>
                <p className="wb-layer-desc">{layer.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Indicators */}
      <div className="wb-metrics-grid" aria-live="polite">
        <div className="wb-metric-card">
          <div className="wb-metric-head">
            <Sparkles size={14} aria-hidden="true" />
            <span>Độ Rõ Ràng & Cụ Thể</span>
          </div>
          <div className="wb-meter-wrap">
            <div className="wb-meter-bar" style={{ width: `${totalClarity}%` }} />
          </div>
          <div className="wb-metric-score">{totalClarity}%</div>
        </div>

        <div className="wb-metric-card">
          <div className="wb-metric-head">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Khả Năng Chống Ảo Giác</span>
          </div>
          <div className="wb-meter-wrap">
            <div
              className="wb-meter-bar wb-meter-bar--ok"
              style={{ width: `${totalHallucinationResistance}%` }}
            />
          </div>
          <div className="wb-metric-score">{totalHallucinationResistance}%</div>
        </div>

        <div className="wb-metric-card">
          <div className="wb-metric-head">
            <Code2 size={14} aria-hidden="true" />
            <span>Độ Ổn Định Định Dạng (Parsable)</span>
          </div>
          <div className="wb-meter-wrap">
            <div
              className="wb-meter-bar wb-meter-bar--accent"
              style={{ width: `${totalParsability}%` }}
            />
          </div>
          <div className="wb-metric-score">{totalParsability}%</div>
        </div>
      </div>

      {/* Live Code Preview */}
      <div className="wb-preview">
        <div className="wb-preview-head">
          <div className="wb-preview-title">
            <Terminal size={14} aria-hidden="true" />
            <span>Bản Xem Trước Prompt Kết Hợp ({activeLayerIds.length} lớp kích hoạt)</span>
          </div>
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={() => setShowFullCode(!showFullCode)}
          >
            <Eye size={12} aria-hidden="true" />
            {showFullCode ? "Thu gọn code" : "Mở rộng toàn màn hình"}
          </button>
        </div>
        <pre className={`wb-code-block ${showFullCode ? "wb-code-block--expanded" : ""}`}>
          <code>{assembledPrompt || "// Chưa chọn lớp nào. Hãy bật ít nhất một lớp ở trên."}</code>
        </pre>
      </div>

      {/* Exam Takeaway Note */}
      <div className="wb-takeaway">
        <strong>Nguyên tắc cốt lõi CCAO-F (Domain 1):</strong>
        <p>
          Anthropic nhấn mạnh: Prompt xuất sắc không phải là một đoạn văn dài miên man, mà là sự phân tầng cấu trúc kỷ luật.
          Kết hợp thẻ XML với tiêu chí nghiệm thu rõ ràng và ví dụ few-shot giúp kết quả đầu ra luôn nhất quán, đáng tin cậy và có thể tích hợp trực tiếp vào hệ thống phần mềm.
        </p>
      </div>
    </figure>
  );
}
