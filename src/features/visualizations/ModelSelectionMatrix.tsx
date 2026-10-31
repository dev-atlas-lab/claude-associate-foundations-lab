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
    tagline: "Optimized for speed & cost (Sub-second Latency & High Volume)",
    inputPerMTok: 1.0,
    outputPerMTok: 5.0,
    ttftLatency: "~400ms",
    throughput: "Very high (>100 tokens/s)",
    reasoningScore: 78,
    codingScore: 75,
    visionScore: 82,
    bestFit: "Routing, intent classification, entity extraction, live chat triage",
    examRole: "Default selection for Efficiency-First architecture and preprocessing pipelines",
  },
  {
    id: "sonnet",
    name: "Claude 3.5 Sonnet",
    tagline: "Benchmark leader in Coding, Multi-step Reasoning & Tool Use",
    inputPerMTok: 3.0,
    outputPerMTok: 15.0,
    ttftLatency: "~800ms",
    throughput: "High (~60 tokens/s)",
    reasoningScore: 96,
    codingScore: 98,
    visionScore: 95,
    bestFit: "Coding agents, multi-step tool calls, enterprise report synthesis, computer use",
    examRole: "Sweet spot model for the vast majority of enterprise production solutions",
  },
  {
    id: "opus",
    name: "Claude 3 Opus",
    tagline: "Deep Reasoning & Multi-source Complex Document Synthesis",
    inputPerMTok: 15.0,
    outputPerMTok: 75.0,
    ttftLatency: "~2.4s",
    throughput: "Standard (~30 tokens/s)",
    reasoningScore: 92,
    codingScore: 86,
    visionScore: 88,
    bestFit: "Academic research, cross-document legal harmonization, novel scientific hypothesis",
    examRole: "Reserved for rare tasks demanding maximum reasoning depth where higher cost is acceptable",
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
    title: "Customer Support Triage & Intent Routing",
    description: "Volume of 20,000 requests/day, <1.5s SLA requirement, extracting intent and dispatching to departments.",
    recommendedModelId: "haiku",
    dailyRequests: 20000,
    avgInputTokens: 600,
    avgOutputTokens: 150,
    primaryDriver: "Sub-second latency and minimal cost following the Efficiency-First principle.",
  },
  {
    id: "coding-agent",
    title: "AI Coding Assistant & Automated Code Review",
    description: "Multi-file repository editing, running tests, fixing nuanced bugs, and refactoring codebases.",
    recommendedModelId: "sonnet",
    dailyRequests: 2000,
    avgInputTokens: 4000,
    avgOutputTokens: 1200,
    primaryDriver: "Requires the highest coding benchmark accuracy and reliable multi-turn tool orchestration.",
  },
  {
    id: "legal-audit",
    title: "Complex Legal & Regulatory Contract Audit",
    description: "Drafting multi-document risk assessments across hundreds of pages with strict zero-hallucination tolerance.",
    recommendedModelId: "sonnet",
    dailyRequests: 500,
    avgInputTokens: 12000,
    avgOutputTokens: 2500,
    primaryDriver: "Requires large context comprehension and multi-hop reasoning; Sonnet 3.5 outperforms and costs 5x less than Opus.",
  },
  {
    id: "invoice-ocr",
    title: "Multimodal Invoice & Structured Document OCR",
    description: "Batch processing scanned invoices, receipts, and extracting structured JSON schemas.",
    recommendedModelId: "haiku",
    dailyRequests: 10000,
    avgInputTokens: 1200,
    avgOutputTokens: 300,
    primaryDriver: "Haiku 3.5 provides high-fidelity vision capabilities at minimal cost for fixed-schema extraction.",
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
    <figure className="matrix-simulator" aria-label="Model & Product Selection Matrix">
      {intro ? <p className="diagram-intro">{intro}</p> : null}

      <div className="matrix-container">
        {/* Step 1: Workload Preset Selector */}
        <div className="matrix-section">
          <div className="matrix-section-head">
            <span className="matrix-badge">Step 1</span>
            <h3 className="matrix-title">Select realistic enterprise workload</h3>
          </div>
          <div className="matrix-preset-grid" role="group" aria-label="Workload presets">
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
                      Recommended: {preset.recommendedModelId.toUpperCase()}
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
            <span className="matrix-badge">Step 2</span>
            <h3 className="matrix-title">Scale parameters (Volume & Token Economics)</h3>
          </div>
          <div className="calc-controls-grid">
            <div className="calc-control-group">
              <div className="calc-control-header">
                <label className="calc-label" htmlFor={reqId}>
                  Daily requests
                </label>
                <span className="calc-value-pill">{dailyRequests.toLocaleString("en-US")} req/day</span>
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
              <span className="calc-subtext">{(dailyRequests * 30).toLocaleString("en-US")} req/month</span>
            </div>

            <div className="calc-control-group">
              <div className="calc-control-header">
                <label className="calc-label" htmlFor={inTokId}>
                  Average input tokens / request
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
              <span className="calc-subtext">Prompt, data context, system instructions</span>
            </div>

            <div className="calc-control-group">
              <div className="calc-control-header">
                <label className="calc-label" htmlFor={outTokId}>
                  Average output tokens / request
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
              <span className="calc-subtext">Generated completion length</span>
            </div>
          </div>
        </div>

        {/* Step 3: Comparative Analysis Across Models */}
        <div className="matrix-section">
          <div className="matrix-section-head">
            <span className="matrix-badge">Step 3</span>
            <h3 className="matrix-title">Compare Claude 3.5 model families for this workload</h3>
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
                    {isRecommended ? <Badge tone="ok">Optimal Choice</Badge> : null}
                  </div>

                  <div className="matrix-cost-box">
                    <span className="matrix-cost-label">Estimated monthly cost (30 days)</span>
                    <span className="matrix-cost-value">${cost.toLocaleString("en-US")}</span>
                    <span className="matrix-cost-rate">
                      ${model.inputPerMTok} in / ${model.outputPerMTok} out per 1M tokens
                    </span>
                  </div>

                  <div className="matrix-specs-grid">
                    <div className="matrix-spec-item">
                      <span className="matrix-spec-key">
                        <Zap size={13} strokeWidth={2} aria-hidden="true" /> TTFT Latency:
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
                        <Layers size={13} strokeWidth={2} aria-hidden="true" /> Reasoning Power:
                      </span>
                      <span className="matrix-spec-val">{model.reasoningScore}/100</span>
                    </div>
                  </div>

                  <div className="matrix-fit-box">
                    <strong>Typical tasks:</strong> {model.bestFit}
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
            <span>Key Principle for CCAO-F (Domain 3)</span>
          </div>
          <p className="workflow-takeaway-body">
            In the CCAO-F exam, Anthropic strongly emphasizes the <strong>Efficiency-First</strong> principle:
            always start with <strong>Claude 3.5 Haiku</strong> for low-latency, classification, or high-volume tasks.
            Only upgrade to <strong>Claude 3.5 Sonnet</strong> when the workflow demands multi-step reasoning, coding, or complex tool execution.
            Avoid defaulting to Opus for tasks already solved cleanly and at 5x–15x lower cost by Sonnet or Haiku.
          </p>
        </div>
      </div>
    </figure>
  );
}
