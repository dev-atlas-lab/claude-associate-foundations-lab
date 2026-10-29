import { CheckCircle2, Cpu, Layers, Sparkles, Zap } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Badge } from "../../components/ui/Badge";

export interface ModelProfile {
  id: "haiku" | "sonnet" | "opus";
  name: string;
  tagline: string;
  inputPerMTok: number;
  outputPerMTok: number;
  ttftLatency: string;
  throughput: string;
  reasoningScore: number; // 1-100
  codingScore: number;
  visionScore: number;
  bestFit: string;
  examRole: string;
}

const MODEL_PROFILES: ModelProfile[] = [
  {
    id: "haiku",
    name: "Claude 3.5 Haiku",
    tagline: "Tối ưu tốc độ & chi phí (Sub-second Latency & High Volume)",
    inputPerMTok: 1.0,
    outputPerMTok: 5.0,
    ttftLatency: "~400ms",
    throughput: "Cực cao (>100 tokens/s)",
    reasoningScore: 78,
    codingScore: 75,
    visionScore: 82,
    bestFit: "Routing, phân loại intent, trích xuất thực thể, live chat bot",
    examRole: "Lựa chọn mặc định cho kiến trúc Efficiency-First và các bước tiền xử lý",
  },
  {
    id: "sonnet",
    name: "Claude 3.5 Sonnet",
    tagline: "Đầu bảng về Coding, Suy luận đa bước & Tool Use",
    inputPerMTok: 3.0,
    outputPerMTok: 15.0,
    ttftLatency: "~800ms",
    throughput: "Cao (~60 tokens/s)",
    reasoningScore: 96,
    codingScore: 98,
    visionScore: 95,
    bestFit: "Coding agent, gọi tool phức tạp, phân tích báo cáo doanh nghiệp, computer use",
    examRole: "Mô hình cân bằng tối ưu (Sweet spot) cho hầu hết các giải pháp doanh nghiệp",
  },
  {
    id: "opus",
    name: "Claude 3 Opus",
    tagline: "Suy luận chiều sâu & Tổng hợp tài liệu đa nguồn phức tạp",
    inputPerMTok: 15.0,
    outputPerMTok: 75.0,
    ttftLatency: "~2.4s",
    throughput: "Tiêu chuẩn (~30 tokens/s)",
    reasoningScore: 92,
    codingScore: 86,
    visionScore: 88,
    bestFit: "Nghiên cứu học thuật, đối chiếu pháp lý đa văn bản, giả thuyết khoa học",
    examRole: "Dành riêng cho các tác vụ đòi hỏi chiều sâu suy luận và chấp nhận chi phí cao",
  },
];

interface WorkloadPreset {
  id: string;
  title: string;
  description: string;
  recommendedModelId: "haiku" | "sonnet" | "opus";
  dailyRequests: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  primaryDriver: string;
}

const WORKLOAD_PRESETS: WorkloadPreset[] = [
  {
    id: "customer-triage",
    title: "Phân loại & Định tuyến Hỗ trợ khách hàng (Customer Triage)",
    description: "Khối lượng 20.000 yêu cầu/ngày, yêu cầu SLA phản hồi <1.5s, nghiệp vụ bóc tách intent và chuyển tiếp phòng ban.",
    recommendedModelId: "haiku",
    dailyRequests: 20000,
    avgInputTokens: 600,
    avgOutputTokens: 150,
    primaryDriver: "Độ trễ thấp và chi phí tối thiểu theo nguyên tắc Efficiency-First.",
  },
  {
    id: "coding-agent",
    title: "AI Coding Assistant & Tự động hóa Review Code",
    description: "Nhân viên dùng tool đọc/sửa repo đa file, chạy unit test, sửa lỗi bug phức tạp và tái cấu trúc code.",
    recommendedModelId: "sonnet",
    dailyRequests: 2000,
    avgInputTokens: 4000,
    avgOutputTokens: 1200,
    primaryDriver: "Đòi hỏi điểm benchmark coding cao nhất và khả năng điều phối tool use chuẩn xác.",
  },
  {
    id: "legal-audit",
    title: "Thẩm định Hồ sơ Pháp lý & Hợp đồng Phức tạp",
    description: "Soạn thảo phân tích rủi ro đa tài liệu hàng trăm trang, yêu cầu lập luận logic chặt chẽ và không được phép sai sót.",
    recommendedModelId: "sonnet",
    dailyRequests: 500,
    avgInputTokens: 12000,
    avgOutputTokens: 2500,
    primaryDriver: "Cần khả năng hiểu context lớn và suy luận đa chiều; Sonnet 3.5 vượt trội và tiết kiệm hơn Opus.",
  },
  {
    id: "invoice-ocr",
    title: "Trích xuất Hóa đơn & Bảng biểu Đa phương thức (Multimodal OCR)",
    description: "Xử lý hàng loạt hình ảnh scan hóa đơn, biên nhận và xuất ra định dạng JSON chuẩn hóa.",
    recommendedModelId: "haiku",
    dailyRequests: 10000,
    avgInputTokens: 1200,
    avgOutputTokens: 300,
    primaryDriver: "Haiku 3.5 hỗ trợ vision chất lượng cao với chi phí cực thấp cho tác vụ có schema cố định.",
  },
];

export function ModelSelectionMatrix({ intro }: { intro?: string }) {
  const reqId = useId();
  const inTokId = useId();
  const outTokId = useId();

  const [selectedPresetId, setSelectedPresetId] = useState<string>("customer-triage");
  const [activeModelTab, setActiveModelTab] = useState<"haiku" | "sonnet" | "opus">("haiku");

  const currentPreset = WORKLOAD_PRESETS.find((p) => p.id === selectedPresetId) ?? WORKLOAD_PRESETS[0];

  const [dailyRequests, setDailyRequests] = useState<number>(currentPreset.dailyRequests);
  const [inputTokens, setInputTokens] = useState<number>(currentPreset.avgInputTokens);
  const [outputTokens, setOutputTokens] = useState<number>(currentPreset.avgOutputTokens);

  function handleSelectPreset(preset: WorkloadPreset) {
    setSelectedPresetId(preset.id);
    setDailyRequests(preset.dailyRequests);
    setInputTokens(preset.avgInputTokens);
    setOutputTokens(preset.avgOutputTokens);
    setActiveModelTab(preset.recommendedModelId);
  }

  // Cost estimates for 30 days
  const costEstimates = useMemo(() => {
    const monthlyRequests = dailyRequests * 30;
    const calcMonthlyCost = (inputRate: number, outputRate: number) => {
      const inputCost = (monthlyRequests * inputTokens * inputRate) / 1_000_000;
      const outputCost = (monthlyRequests * outputTokens * outputRate) / 1_000_000;
      return Math.round((inputCost + outputCost) * 100) / 100;
    };

    return {
      haiku: calcMonthlyCost(1.0, 5.0),
      sonnet: calcMonthlyCost(3.0, 15.0),
      opus: calcMonthlyCost(15.0, 75.0),
    };
  }, [dailyRequests, inputTokens, outputTokens]);

  return (
    <figure className="matrix-simulator" aria-label="Ma trận Lựa chọn Model & Bề mặt sản phẩm">
      {intro ? <p className="diagram-intro">{intro}</p> : null}

      <div className="matrix-container">
        {/* Step 1: Workload Preset Selector */}
        <div className="matrix-section">
          <div className="matrix-section-head">
            <span className="matrix-badge">Bước 1</span>
            <h3 className="matrix-title">Chọn tình huống nghiệp vụ thực tế (Enterprise Workloads)</h3>
          </div>
          <div className="matrix-preset-grid" role="group" aria-label="Tình huống khối lượng công việc">
            {WORKLOAD_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  className={`matrix-preset-card ${isSelected ? "matrix-preset-card--active" : ""}`}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <div className="matrix-preset-header">
                    <span className="matrix-preset-title">{preset.title}</span>
                    <Badge tone={isSelected ? "accent" : "neutral"}>
                      Gợi ý: {preset.recommendedModelId.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="matrix-preset-desc">{preset.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Fine-tune Parameters */}
        <div className="matrix-section">
          <div className="matrix-section-head">
            <span className="matrix-badge">Bước 2</span>
            <h3 className="matrix-title">Thông số tính toán quy mô (Volume & Token Economics)</h3>
          </div>
          <div className="calc-controls-grid">
            <div className="calc-control-group">
              <div className="calc-control-header">
                <label className="calc-label" htmlFor={reqId}>
                  Số request mỗi ngày
                </label>
                <span className="calc-value-pill">{dailyRequests.toLocaleString("en-US")} req/ngày</span>
              </div>
              <input
                id={reqId}
                className="calc-range-input"
                type="range"
                min={500}
                max={50000}
                step={500}
                value={dailyRequests}
                onChange={(e) => setDailyRequests(Number(e.target.value))}
              />
              <span className="calc-subtext">{(dailyRequests * 30).toLocaleString("en-US")} req/tháng</span>
            </div>

            <div className="calc-control-group">
              <div className="calc-control-header">
                <label className="calc-label" htmlFor={inTokId}>
                  Input tokens trung bình / request
                </label>
                <span className="calc-value-pill">{inputTokens.toLocaleString("en-US")} tokens</span>
              </div>
              <input
                id={inTokId}
                className="calc-range-input"
                type="range"
                min={200}
                max={15000}
                step={100}
                value={inputTokens}
                onChange={(e) => setInputTokens(Number(e.target.value))}
              />
              <span className="calc-subtext">Prompt, context dữ liệu, system instructions</span>
            </div>

            <div className="calc-control-group">
              <div className="calc-control-header">
                <label className="calc-label" htmlFor={outTokId}>
                  Output tokens trung bình / request
                </label>
                <span className="calc-value-pill">{outputTokens.toLocaleString("en-US")} tokens</span>
              </div>
              <input
                id={outTokId}
                className="calc-range-input"
                type="range"
                min={100}
                max={4000}
                step={50}
                value={outputTokens}
                onChange={(e) => setOutputTokens(Number(e.target.value))}
              />
              <span className="calc-subtext">Độ dài câu trả lời sinh ra</span>
            </div>
          </div>
        </div>

        {/* Step 3: Comparative Analysis Across Models */}
        <div className="matrix-section">
          <div className="matrix-section-head">
            <span className="matrix-badge">Bước 3</span>
            <h3 className="matrix-title">So sánh 3 dòng mô hình Claude 3.5 theo bài toán hiện tại</h3>
          </div>

          <div className="matrix-model-grid">
            {MODEL_PROFILES.map((model) => {
              const isRecommended = currentPreset.recommendedModelId === model.id;
              const isSelected = activeModelTab === model.id;
              const cost = costEstimates[model.id];

              return (
                <button
                  key={model.id}
                  type="button"
                  className={`matrix-model-card ${isSelected ? "matrix-model-card--selected" : ""} ${
                    isRecommended ? "matrix-model-card--recommended" : ""
                  }`}
                  onClick={() => setActiveModelTab(model.id)}
                  aria-pressed={isSelected}
                >
                  <div className="matrix-model-header">
                    <div>
                      <h4 className="matrix-model-name">{model.name}</h4>
                      <span className="matrix-model-tagline">{model.tagline}</span>
                    </div>
                    {isRecommended ? <Badge tone="ok">Đề xuất tối ưu</Badge> : null}
                  </div>

                  <div className="matrix-cost-box">
                    <span className="matrix-cost-label">Ước tính chi phí / tháng (30 ngày)</span>
                    <span className="matrix-cost-value">${cost.toLocaleString("en-US")}</span>
                    <span className="matrix-cost-rate">
                      ${model.inputPerMTok} in / ${model.outputPerMTok} out trên 1M tokens
                    </span>
                  </div>

                  <div className="matrix-specs-grid">
                    <div className="matrix-spec-item">
                      <span className="matrix-spec-key">
                        <Zap size={13} strokeWidth={2} aria-hidden="true" /> Độ trễ TTFT:
                      </span>
                      <span className="matrix-spec-val">{model.ttftLatency}</span>
                    </div>
                    <div className="matrix-spec-item">
                      <span className="matrix-spec-key">
                        <Cpu size={13} strokeWidth={2} aria-hidden="true" /> Throughput:
                      </span>
                      <span className="matrix-spec-val">{model.throughput}</span>
                    </div>
                    <div className="matrix-spec-item">
                      <span className="matrix-spec-key">
                        <Sparkles size={13} strokeWidth={2} aria-hidden="true" /> Coding & Tools:
                      </span>
                      <span className="matrix-spec-val">{model.codingScore}/100</span>
                    </div>
                    <div className="matrix-spec-item">
                      <span className="matrix-spec-key">
                        <Layers size={13} strokeWidth={2} aria-hidden="true" /> Khả năng Reasoning:
                      </span>
                      <span className="matrix-spec-val">{model.reasoningScore}/100</span>
                    </div>
                  </div>

                  <div className="matrix-fit-box">
                    <strong>Tác vụ điển hình:</strong> {model.bestFit}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Key Takeaway Banner */}
        <div className="workflow-takeaway" style={{ marginTop: "var(--space-4)" }}>
          <div className="workflow-takeaway-head">
            <CheckCircle2 size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>Nguyên tắc then chốt cho kỳ thi CCAO-F (Domain 3)</span>
          </div>
          <p className="workflow-takeaway-body">
            Trong kỳ thi CCAO-F, Anthropic luôn ưu tiên nguyên tắc <strong>Efficiency-First</strong>:
            bắt đầu với <strong>Claude 3.5 Haiku</strong> cho các tác vụ cần tốc độ cao, phân loại hoặc khối lượng lớn.
            Chỉ nâng cấp lên <strong>Claude 3.5 Sonnet</strong> khi bài toán đòi hỏi lập luận logic đa bước, coding hoặc gọi tool phức tạp.
            Tránh lạm dụng Opus cho các bài toán đã được giải quyết hoàn hảo bởi Sonnet hoặc Haiku để tiết kiệm từ 5x đến 15x chi phí.
          </p>
        </div>
      </div>
    </figure>
  );
}
