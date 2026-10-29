import { useState } from "react";
import { ArrowDownRight, Calculator, CheckCircle2, Clock, DollarSign, Sparkles, Zap } from "lucide-react";

type ModelKey = "haiku" | "sonnet" | "opus";

interface ModelPricing {
  name: string;
  badge: string;
  inputPerMillion: number;
  cacheReadPerMillion: number;
  cacheWritePerMillion: number;
  outputPerMillion: number;
  minCacheTokens: number;
  typicalTtftUncachedMs: number;
  typicalTtftCachedMs: number;
  roleDescription: string;
}

const modelProfiles: Record<ModelKey, ModelPricing> = {
  haiku: {
    name: "Claude 3.5 Haiku",
    badge: "Tốc độ cao & Chi phí thấp nhất",
    inputPerMillion: 1.0,
    cacheReadPerMillion: 0.1, // 90% discount
    cacheWritePerMillion: 1.25, // 1.25x initial write
    outputPerMillion: 5.0,
    minCacheTokens: 2048,
    typicalTtftUncachedMs: 450,
    typicalTtftCachedMs: 150,
    roleDescription: "Rất phù hợp cho phân loại ý định, trích xuất dữ liệu, gắn thẻ nhanh và các bước trung gian.",
  },
  sonnet: {
    name: "Claude 3.5 Sonnet",
    badge: "Tiêu chuẩn vàng cho Doanh nghiệp",
    inputPerMillion: 3.0,
    cacheReadPerMillion: 0.3, // 90% discount
    cacheWritePerMillion: 3.75, // 1.25x
    outputPerMillion: 15.0,
    minCacheTokens: 1024,
    typicalTtftUncachedMs: 1200,
    typicalTtftCachedMs: 350,
    roleDescription: "Cân bằng tối ưu giữa năng lực suy luận sâu sắc, phân tích đa bước và hiệu quả kinh tế.",
  },
  opus: {
    name: "Claude 3 Opus",
    badge: "Suy luận Phức tạp Chuyên sâu",
    inputPerMillion: 15.0,
    cacheReadPerMillion: 1.5, // 90% discount
    cacheWritePerMillion: 18.75, // 1.25x
    outputPerMillion: 75.0,
    minCacheTokens: 1024,
    typicalTtftUncachedMs: 2800,
    typicalTtftCachedMs: 800,
    roleDescription: "Phù hợp cho lập luận đa tầng, phân tích pháp lý chuyên sâu và giải quyết vấn đề toán học/chiến lược mở.",
  },
};

export function PromptCachingCostCalculator({ intro }: { intro: string }) {
  const [selectedModel, setSelectedModel] = useState<ModelKey>("sonnet");
  const [contextTokens, setContextTokens] = useState<number>(25000);
  const [turnCount, setTurnCount] = useState<number>(10);
  const [newTokensPerTurn] = useState<number>(500); // User query + tools
  const [outputTokensPerTurn] = useState<number>(600); // Claude reply

  const model = modelProfiles[selectedModel];
  const isCacheEligible = contextTokens >= model.minCacheTokens;

  // Calculation WITHOUT Caching:
  // Every turn re-processes the entire context + user message + produces output
  const totalInputTokensPerTurn = contextTokens + newTokensPerTurn;
  const costWithoutCachingPerTurn =
    (totalInputTokensPerTurn / 1_000_000) * model.inputPerMillion +
    (outputTokensPerTurn / 1_000_000) * model.outputPerMillion;
  const totalCostWithoutCaching = costWithoutCachingPerTurn * turnCount;

  // Calculation WITH Prompt Caching:
  // Turn 1: 1 Cache Write for context + 1 Base Input for new tokens + output
  // Turn 2 to N: Cache Read for context (90% discount) + Base Input for new tokens + output
  const turn1CostWithCache =
    (contextTokens / 1_000_000) * model.cacheWritePerMillion +
    (newTokensPerTurn / 1_000_000) * model.inputPerMillion +
    (outputTokensPerTurn / 1_000_000) * model.outputPerMillion;

  const subsequentTurnsCostWithCache =
    (turnCount - 1) *
    ((contextTokens / 1_000_000) * model.cacheReadPerMillion +
      (newTokensPerTurn / 1_000_000) * model.inputPerMillion +
      (outputTokensPerTurn / 1_000_000) * model.outputPerMillion);

  const totalCostWithCaching = isCacheEligible
    ? turn1CostWithCache + (turnCount > 1 ? subsequentTurnsCostWithCache : 0)
    : totalCostWithoutCaching;

  const moneySaved = Math.max(0, totalCostWithoutCaching - totalCostWithCaching);
  const percentSaved =
    totalCostWithoutCaching > 0 ? (moneySaved / totalCostWithoutCaching) * 100 : 0;

  return (
    <figure className="diagram cost-calculator" aria-label="Prompt Caching & Cost Calculator">
      <div className="calc-header">
        <div className="calc-title-row">
          <Calculator size={18} className="calc-icon" aria-hidden="true" />
          <h3 className="calc-title">Công cụ Tương tác: Tính Toán Chi Phí & Lợi Ích Prompt Caching</h3>
        </div>
        <p className="calc-intro">{intro}</p>
      </div>

      {/* Model Selection Tabs */}
      <div className="calc-model-selector" role="group" aria-label="Model Selection">
        {(Object.keys(modelProfiles) as ModelKey[]).map((key) => {
          const m = modelProfiles[key];
          const isSelected = selectedModel === key;
          return (
            <button
              key={key}
              type="button"
              className={`calc-model-btn ${isSelected ? "calc-model-btn--active" : ""}`}
              onClick={() => setSelectedModel(key)}
              aria-pressed={isSelected}
            >
              <span className="calc-model-name">{m.name}</span>
              <span className="calc-model-badge">{m.badge}</span>
              <span className="calc-model-price">
                ${m.inputPerMillion}/M input · ${m.outputPerMillion}/M output
              </span>
            </button>
          );
        })}
      </div>

      <div className="calc-role-note">
        <strong>Vai trò kiến trúc đề xuất:</strong> {model.roleDescription}
      </div>

      {/* Interactive Controls */}
      <div className="calc-controls-grid">
        <div className="calc-control-group">
          <label htmlFor="context-slider" className="calc-label">
            <span>Độ dài Ngữ cảnh Cố định (Project Knowledge / System Docs / RAG):</span>
            <strong className="mono">{contextTokens.toLocaleString()} tokens</strong>
          </label>
          <input
            id="context-slider"
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={contextTokens}
            onChange={(e) => setContextTokens(Number(e.target.value))}
            className="calc-slider"
          />
          <div className="calc-slider-hints">
            <span>1k (Tài liệu ngắn)</span>
            <span>25k (Sổ tay nhân sự)</span>
            <span>100k (Toàn bộ codebase/hợp đồng)</span>
          </div>
        </div>

        <div className="calc-control-group">
          <label htmlFor="turns-slider" className="calc-label">
            <span>Số lượt truy vấn trong phiên làm việc 5 phút (Cache TTL):</span>
            <strong className="mono">{turnCount} lượt gọi API</strong>
          </label>
          <input
            id="turns-slider"
            type="range"
            min={1}
            max={50}
            step={1}
            value={turnCount}
            onChange={(e) => setTurnCount(Number(e.target.value))}
            className="calc-slider"
          />
          <div className="calc-slider-hints">
            <span>1 lượt (Chưa tận dụng cache)</span>
            <span>10 lượt (Hội thoại chuẩn)</span>
            <span>50 lượt (Batch / Support Desk)</span>
          </div>
        </div>
      </div>

      {/* Eligibility Indicator */}
      <div className="calc-eligibility">
        {isCacheEligible ? (
          <div className="calc-status calc-status--ok">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>
              Ngữ cảnh <strong>{contextTokens.toLocaleString()} tokens</strong> vượt mốc tối thiểu{" "}
              <strong>{model.minCacheTokens.toLocaleString()} tokens</strong> của {model.name}. Prompt
              Caching được kích hoạt tự động với <strong>90% chiết khấu đọc token</strong>!
            </span>
          </div>
        ) : (
          <div className="calc-status calc-status--warn">
            <Clock size={16} aria-hidden="true" />
            <span>
              Chưa đủ điều kiện cache: {model.name} yêu cầu tối thiểu {model.minCacheTokens.toLocaleString()}{" "}
              tokens trong prefix tĩnh để tạo cache breakpoint.
            </span>
          </div>
        )}
      </div>

      {/* Comparison Metrics Cards */}
      <div className="calc-results-grid" aria-live="polite">
        <div className="calc-card calc-card--standard">
          <span className="calc-card-eyebrow">Chi phí Không dùng Cache</span>
          <div className="calc-card-amount">
            <DollarSign size={20} aria-hidden="true" />
            <span>{totalCostWithoutCaching.toFixed(4)}</span>
          </div>
          <p className="calc-card-detail">
            Mỗi lượt đều nạp lại toàn bộ {contextTokens.toLocaleString()} tokens với giá gốc.
          </p>
          <div className="calc-card-metric">
            <Clock size={14} aria-hidden="true" />
            <span>
              Độ trễ TTFT: ~<strong>{model.typicalTtftUncachedMs}ms</strong>
            </span>
          </div>
        </div>

        <div className="calc-card calc-card--cached">
          <span className="calc-card-eyebrow">
            <Sparkles size={14} aria-hidden="true" /> Chi phí Khi Dùng Prompt Caching
          </span>
          <div className="calc-card-amount text-ok">
            <DollarSign size={20} aria-hidden="true" />
            <span>{totalCostWithCaching.toFixed(4)}</span>
          </div>
          <p className="calc-card-detail">
            Lượt 1 nạp cache (1.25x), các lượt sau chỉ trả 10% giá đọc (${model.cacheReadPerMillion}/M).
          </p>
          <div className="calc-card-metric text-ok">
            <Zap size={14} aria-hidden="true" />
            <span>
              Độ trễ TTFT: ~<strong>{model.typicalTtftCachedMs}ms</strong> (giảm ~
              {(
                ((model.typicalTtftUncachedMs - model.typicalTtftCachedMs) /
                  model.typicalTtftUncachedMs) *
                100
              ).toFixed(0)}
              %)
            </span>
          </div>
        </div>

        <div className="calc-card calc-card--savings">
          <span className="calc-card-eyebrow">Tổng Khoản Tiết Kiệm</span>
          <div className="calc-card-amount text-accent">
            <ArrowDownRight size={22} aria-hidden="true" />
            <span>{percentSaved.toFixed(1)}%</span>
          </div>
          <p className="calc-card-detail">
            Tiết kiệm được <strong>${moneySaved.toFixed(4)}</strong> cho phiên {turnCount} lượt gọi này.
          </p>
          <div className="calc-card-badge-row">
            <span className="badge badge--ok">90% Giảm giá Read Cache</span>
            <span className="badge badge--sm">TTL 5 Phút</span>
          </div>
        </div>
      </div>

      {/* Key Associate Exam Facts */}
      <div className="calc-takeaway">
        <h4 className="calc-takeaway-title">3 Điểm Cốt Lõi cho Kỳ Thi CCAO-F (Domain 7)</h4>
        <ul className="calc-takeaway-list">
          <li>
            <strong>Ngưỡng tối thiểu & TTL:</strong> Ngưỡng tạo cache là <strong>1,024 tokens</strong> (Sonnet/Opus) và <strong>2,048 tokens</strong> (Haiku). Cache tồn tại trong <strong>5 phút</strong> và được gia hạn tự động sau mỗi lượt đọc.
          </li>
          <li>
            <strong>Cấu trúc Cache Breakpoint:</strong> Hãy gom tất cả tài liệu tham khảo, system prompt và hướng dẫn tĩnh lên phía trên cùng của prompt để tận dụng cache prefix dài nhất.
          </li>
          <li>
            <strong>Prompt Caching vs. Batch Processing:</strong> Caching giảm 90% cho tương tác hội thoại thời gian thực có tiền tố lặp lại. Batch API giảm 50% cho các tác vụ bất đồng bộ cho phép trả kết quả trong 24 giờ.
          </li>
        </ul>
      </div>
    </figure>
  );
}
