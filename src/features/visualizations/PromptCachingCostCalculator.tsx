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
    badge: "Highest Speed & Lowest Cost",
    inputPerMillion: 1.0,
    cacheReadPerMillion: 0.1, // 90% discount
    cacheWritePerMillion: 1.25, // 1.25x initial write
    outputPerMillion: 5.0,
    minCacheTokens: 2048,
    typicalTtftUncachedMs: 450,
    typicalTtftCachedMs: 150,
    roleDescription: "Ideal for intent classification, data extraction, fast tagging, and intermediate workflow steps.",
  },
  sonnet: {
    name: "Claude 3.5 Sonnet",
    badge: "Enterprise Standard Balance",
    inputPerMillion: 3.0,
    cacheReadPerMillion: 0.3, // 90% discount
    cacheWritePerMillion: 3.75, // 1.25x
    outputPerMillion: 15.0,
    minCacheTokens: 1024,
    typicalTtftUncachedMs: 1200,
    typicalTtftCachedMs: 350,
    roleDescription: "Optimal balance between deep multi-step reasoning, coding, and economics.",
  },
  opus: {
    name: "Claude 3 Opus",
    badge: "Deep Complex Reasoning",
    inputPerMillion: 15.0,
    cacheReadPerMillion: 1.5, // 90% discount
    cacheWritePerMillion: 18.75, // 1.25x
    outputPerMillion: 75.0,
    minCacheTokens: 1024,
    typicalTtftUncachedMs: 2800,
    typicalTtftCachedMs: 800,
    roleDescription: "Suited for multi-layered argumentation, nuanced legal synthesis, and open-ended strategic analysis.",
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
          <h3 className="calc-title">Interactive Tool: Prompt Caching Cost & Economics Calculator</h3>
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
        <strong>Recommended architectural role:</strong> {model.roleDescription}
      </div>

      {/* Interactive Controls */}
      <div className="calc-controls-grid">
        <div className="calc-control-group">
          <label htmlFor="context-slider" className="calc-label">
            <span>Static Prefix Context Length (Project Knowledge / System Prompt / Docs):</span>
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
            <span>1k (Brief doc)</span>
            <span>25k (Employee handbook)</span>
            <span>100k (Full codebase / Legal agreement)</span>
          </div>
        </div>

        <div className="calc-control-group">
          <label htmlFor="turns-slider" className="calc-label">
            <span>Number of query turns in a 5-minute session (Cache TTL window):</span>
            <strong className="mono">{turnCount} API calls</strong>
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
            <span>1 call (No cache reuse)</span>
            <span>10 calls (Standard chat)</span>
            <span>50 calls (Batch / Support Desk)</span>
          </div>
        </div>
      </div>

      {/* Eligibility Indicator */}
      <div className="calc-eligibility">
        {isCacheEligible ? (
          <div className="calc-status calc-status--ok">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>
              Context of <strong>{contextTokens.toLocaleString()} tokens</strong> exceeds the minimum threshold of{" "}
              <strong>{model.minCacheTokens.toLocaleString()} tokens</strong> for {model.name}. Prompt
              Caching is automatically activated with a <strong>90% discount on cache reads</strong>!
            </span>
          </div>
        ) : (
          <div className="calc-status calc-status--warn">
            <Clock size={16} aria-hidden="true" />
            <span>
              Not eligible for caching: {model.name} requires a minimum of {model.minCacheTokens.toLocaleString()}{" "}
              tokens in the static prefix to establish a cache breakpoint.
            </span>
          </div>
        )}
      </div>

      {/* Comparison Metrics Cards */}
      <div className="calc-results-grid" aria-live="polite">
        <div className="calc-card calc-card--standard">
          <span className="calc-card-eyebrow">Cost Without Prompt Caching</span>
          <div className="calc-card-amount">
            <DollarSign size={20} aria-hidden="true" />
            <span>{totalCostWithoutCaching.toFixed(4)}</span>
          </div>
          <p className="calc-card-detail">
            Every turn re-processes all {contextTokens.toLocaleString()} tokens at standard base input rate.
          </p>
          <div className="calc-card-metric">
            <Clock size={14} aria-hidden="true" />
            <span>
              Estimated TTFT: ~<strong>{model.typicalTtftUncachedMs}ms</strong>
            </span>
          </div>
        </div>

        <div className="calc-card calc-card--cached">
          <span className="calc-card-eyebrow">
            <Sparkles size={14} aria-hidden="true" /> Cost With Prompt Caching
          </span>
          <div className="calc-card-amount text-ok">
            <DollarSign size={20} aria-hidden="true" />
            <span>{totalCostWithCaching.toFixed(4)}</span>
          </div>
          <p className="calc-card-detail">
            Turn 1 writes cache (1.25x), subsequent turns pay only 10% read price (${model.cacheReadPerMillion}/M).
          </p>
          <div className="calc-card-metric text-ok">
            <Zap size={14} aria-hidden="true" />
            <span>
              Estimated TTFT: ~<strong>{model.typicalTtftCachedMs}ms</strong> (reduced by ~
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
          <span className="calc-card-eyebrow">Total Net Savings</span>
          <div className="calc-card-amount text-accent">
            <ArrowDownRight size={22} aria-hidden="true" />
            <span>{percentSaved.toFixed(1)}%</span>
          </div>
          <p className="calc-card-detail">
            Saved <strong>${moneySaved.toFixed(4)}</strong> over this {turnCount}-turn session.
          </p>
          <div className="calc-card-badge-row">
            <span className="badge badge--ok">90% Cache Read Discount</span>
            <span className="badge badge--sm">5-Min TTL</span>
          </div>
        </div>
      </div>

      {/* Key Associate Exam Facts */}
      <div className="calc-takeaway">
        <div className="calc-takeaway-title">3 Key Principles for CCAO-F (Domain 7)</div>
        <ul className="calc-takeaway-list">
          <li>
            <strong>Minimum Threshold & TTL:</strong> Minimum cacheable prompt length is <strong>1,024 tokens</strong> (Sonnet/Opus) and <strong>2,048 tokens</strong> (Haiku). Cache lifetime is <strong>5 minutes</strong>, refreshed automatically on each cache read.
          </li>
          <li>
            <strong>Cache Breakpoint Placement:</strong> Cluster all static reference material, system prompts, and tool schemas at the top of the prompt to maximize the cached prefix length.
          </li>
          <li>
            <strong>Prompt Caching vs. Batch API:</strong> Prompt Caching gives up to 90% savings for real-time conversational turns sharing identical prefixes. Batch Processing offers 50% savings for asynchronous workloads with a 24-hour SLA.
          </li>
        </ul>
      </div>
    </figure>
  );
}
