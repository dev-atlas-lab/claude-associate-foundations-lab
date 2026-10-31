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
    badge: "Common & Cost-Effective",
    summary:
      "A fast, lightweight model (such as Claude 3.5 Haiku) classifies incoming user intent and dispatches to specialized prompts or specialized models.",
    bestFor: "Multi-intent customer support systems, triaging complex queries to specialist models or human agents.",
    examTakeaway:
      "Optimizes cost and latency by reserving larger reasoning models (Sonnet/Opus) only for paths that genuinely require complex logic.",
  },
  {
    id: "evaluator-optimizer",
    name: "2. Evaluator-Optimizer Loop",
    badge: "High Quality with Guardrails",
    summary:
      "One model generates a draft (Generator), while a second model acts as an independent auditor (Evaluator) grading against a clear rubric. The loop repeats until acceptance criteria are met or max iterations are reached, with a human review checkpoint.",
    bestFor: "High-stakes report drafting, legal contract translation, and code generation with verified test suites.",
    examTakeaway:
      "Only effective when evaluation criteria (rubrics) are unambiguously measurable; always requires an explicit stopping condition to prevent unbounded token loops.",
  },
  {
    id: "parallelization",
    name: "3. Parallelization (Sectioning / Voting)",
    badge: "Minimizes End-to-End Latency",
    summary:
      "Decomposes a large task into independent concurrent branches running in parallel, synthesized by a final aggregator step.",
    bestFor: "Reviewing multiple independent documents, multi-perspective risk auditing (financial, legal, technical) simultaneously.",
    examTakeaway:
      "Total latency equals the longest running branch rather than the sum of sequential calls; requires subtasks to be strictly independent.",
  },
  {
    id: "orchestrator-workers",
    name: "4. Orchestrator-Workers",
    badge: "Flexible for Open-Ended Tasks",
    summary:
      "A central orchestrator analyzes complex high-level goals, dynamically breaks them down into subtasks, delegates them to specialized worker LLMs, and synthesizes the findings.",
    bestFor: "In-depth competitive intelligence, market research, or multi-source documentation synthesis.",
    examTakeaway:
      "More dynamic than hardcoded sequential workflows; requires strict worker invocation limits and token budget guardrails.",
  },
];

const routingExamples = [
  {
    query: "“My credit card was charged twice on October 15th, please refund the duplicate.”",
    intent: "Billing & Invoice Dispute",
    target: "Billing Sub-Agent (Claude 3.5 Haiku)",
    risk: "Low",
    cost: "Very low ($0.001)",
  },
  {
    query: "“Our microservices thread pool is bottlenecked at 50,000 req/s, analyze thread dump logs.”",
    intent: "Architecture Incident Diagnostic",
    target: "Senior Tech Diagnostic (Claude 3.5 Sonnet)",
    risk: "Medium",
    cost: "Moderate ($0.015)",
  },
  {
    query: "“Proposal to assign exclusive intellectual property rights of core algorithms to foreign partner.”",
    intent: "Legal & High-Risk Compliance",
    target: "Human Legal Checkpoint (Escalate to Counsel)",
    risk: "Very high",
    cost: "Manual human review",
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
          <h3 className="workflow-title">Visual Simulation: Workflow Design Patterns</h3>
        </div>
        <p className="workflow-intro">{intro}</p>
      </div>

      {/* Pattern Selector Buttons */}
      <div className="workflow-tabs" role="group" aria-label="Workflow Pattern Options">
        {patterns.map((pattern) => (
          <button
            key={pattern.id}
            type="button"
            aria-pressed={selectedPattern === pattern.id}
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
            <strong>Best for:</strong> {active.bestFor}
          </span>
        </div>
        <p className="workflow-summary">{active.summary}</p>
      </div>

      {/* Interactive Canvas Area */}
      <div className="workflow-canvas" aria-live="polite">
        {selectedPattern === "routing" && (
          <div className="workflow-stage workflow-stage--routing">
            <div className="workflow-interactive-bar">
              <span className="workflow-interactive-label">Select sample user prompt:</span>
              <div className="workflow-btn-group" role="group" aria-label="Routing query examples">
                {routingExamples.map((ex, idx) => (
                  <button
                    key={ex.intent}
                    type="button"
                    className={`button button--sm ${routingIndex === idx ? "button--primary" : "button--secondary"}`}
                    onClick={() => setRoutingIndex(idx)}
                    aria-pressed={routingIndex === idx}
                  >
                    Sample {idx + 1}: {ex.intent}
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
                <span className="flow-node-badge">Classified Intent</span>
                <strong>{activeRoute.intent}</strong>
                <span className="flow-node-sub">Risk level: {activeRoute.risk}</span>
              </div>

              <div className="flow-arrow" aria-hidden="true">
                <ArrowRight size={20} />
                <span className="flow-arrow-text">Dispatch</span>
              </div>

              <div
                className={`flow-node flow-node--target ${
                  activeRoute.risk === "Very high" ? "flow-node--checkpoint" : ""
                }`}
              >
                <span className="flow-node-badge">Handler Destination</span>
                <strong>{activeRoute.target}</strong>
                <span className="flow-node-sub">Estimated cost: {activeRoute.cost}</span>
              </div>
            </div>
          </div>
        )}

        {selectedPattern === "evaluator-optimizer" && (
          <div className="workflow-stage workflow-stage--loop">
            <div className="workflow-interactive-bar">
              <span className="workflow-interactive-label">
                Current cycle: <strong>Iteration {evalStep} / 3</strong>
              </span>
              <button
                type="button"
                className="button button--primary button--sm"
                onClick={handleNextEvalStep}
              >
                <RefreshCw size={14} className={evalStep === 1 ? "" : "spin-subtle"} aria-hidden="true" />
                {evalStep === 1
                  ? "Run Evaluation #1 (Fail rubric)"
                  : evalStep === 2
                    ? "Optimize & Run #2 (Pass rubric)"
                    : "Reset simulator"}
              </button>
            </div>

            <div className="workflow-loop-diagram">
              <div className="flow-node flow-node--generator">
                <span className="flow-node-badge">Generator LLM</span>
                <strong>
                  {evalStep === 1
                    ? "Draft 1 (Missing source citations)"
                    : "Draft 2 (Includes grounded citations and figures)"}
                </strong>
                <span className="flow-node-sub">Generated by Claude 3.5 Sonnet</span>
              </div>

              <div className="flow-arrow" aria-hidden="true">
                <ArrowRight size={20} />
                <span className="flow-arrow-text">Submit draft</span>
              </div>

              <div
                className={`flow-node flow-node--evaluator ${
                  evalStep === 1 ? "flow-node--fail" : "flow-node--pass"
                }`}
              >
                <span className="flow-node-badge">Evaluator Rubric</span>
                {evalStep === 1 ? (
                  <>
                    <strong className="text-warn">Needs Revision (5/10)</strong>
                    <span className="flow-node-sub">Issue: Missing Q3 metric citations</span>
                  </>
                ) : (
                  <>
                    <strong className="text-ok">Meets Criteria (9.5/10)</strong>
                    <span className="flow-node-sub">All acceptance criteria satisfied</span>
                  </>
                )}
              </div>

              <div className="flow-arrow" aria-hidden="true">
                <ArrowRight size={20} />
                <span className="flow-arrow-text">
                  {evalStep === 1 ? "Request revision" : "Handoff to review"}
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
                      <CheckCircle2 size={16} aria-hidden="true" /> Approved for Release
                    </strong>
                    <span className="flow-node-sub">Reviewer approved publish</span>
                  </>
                ) : (
                  <>
                    <strong>Pending Review</strong>
                    <span className="flow-node-sub">Human retains final decision</span>
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
                <span className="flow-node-badge">Input Contract</span>
                <strong>Corporate Merger Agreement (120 pages)</strong>
              </div>

              <div className="flow-parallel-branches">
                <div className="flow-branch-node">
                  <span className="flow-node-badge">Branch 1: Legal Review</span>
                  <span>Claude 3.5 Sonnet (Indemnity clauses)</span>
                  <span className="badge badge--sm">Latency: 3.2s</span>
                </div>
                <div className="flow-branch-node">
                  <span className="flow-node-badge">Branch 2: Financial Audit</span>
                  <span>Claude 3.5 Sonnet (Debt covenants & valuation)</span>
                  <span className="badge badge--sm">Latency: 2.8s</span>
                </div>
                <div className="flow-branch-node">
                  <span className="flow-node-badge">Branch 3: Privacy & Security</span>
                  <span>Claude 3.5 Haiku (GDPR personal data transfer)</span>
                  <span className="badge badge--sm">Latency: 1.1s</span>
                </div>
              </div>

              <div className="flow-node flow-node--aggregator">
                <span className="flow-node-badge">Aggregator</span>
                <strong>Consolidated Risk Audit Report</strong>
                <span className="flow-node-sub">
                  Total latency: <strong>3.2s</strong> (parallel execution) instead of <strong>7.1s</strong> (sequential)
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
                <strong>Goal Breakdown: 2026 Competitive Intelligence Analysis</strong>
                <span className="flow-node-sub">Dynamically provisions 3 independent worker tasks</span>
              </div>

              <div className="flow-workers-grid">
                <div className="flow-worker-card">
                  <span className="flow-node-badge">Worker A</span>
                  <strong>Web Search Connector</strong>
                  <p>Fetches recent press releases and new product announcements</p>
                </div>
                <div className="flow-worker-card">
                  <span className="flow-node-badge">Worker B</span>
                  <strong>Financial Doc Parser</strong>
                  <p>Extracts latest SEC 10-Q filing figures</p>
                </div>
                <div className="flow-worker-card">
                  <span className="flow-node-badge">Worker C</span>
                  <strong>Patent Database Query</strong>
                  <p>Analyzes newly filed patent claims over past 6 months</p>
                </div>
              </div>

              <div className="flow-node flow-node--target">
                <span className="flow-node-badge">Synthesis & Review</span>
                <strong>Comprehensive Intelligence Brief with Grounded Citations</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exam Takeaway Footer */}
      <div className="workflow-takeaway">
        <div className="workflow-takeaway-head">
          <ShieldAlert size={14} aria-hidden="true" />
          <strong>Exam Takeaway for CCAO-F (Domain 4)</strong>
        </div>
        <p>{active.examTakeaway}</p>
      </div>
    </figure>
  );
}
