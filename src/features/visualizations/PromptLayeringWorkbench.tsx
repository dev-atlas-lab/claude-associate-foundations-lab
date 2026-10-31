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
    category: "Role Definition",
    description: "Establishes perspective, domain authority, and Claude's baseline tone.",
    codeSnippet: `You are an expert enterprise compliance auditor at a tier-1 financial institution.
Your objective is to review operational procedures against regulatory guidelines with high rigor.`,
    clarityBoost: 20,
    hallucinationReduction: 15,
    parsabilityScore: 10,
    examNote: "System persona establishes the baseline context and should remain stable across conversation turns.",
  },
  {
    id: "xml",
    name: "2. XML Structured Delimiters",
    category: "Context Separation",
    description: "Employs XML tags (<context>, <guidelines>, <documents>) to clearly delineate data boundaries.",
    codeSnippet: `<context>
  <policy_document id="POL-2026-A">
    All customer data transfers outside the APAC region require prior DPO approval.
  </policy_document>
</context>`,
    clarityBoost: 25,
    hallucinationReduction: 30,
    parsabilityScore: 25,
    examNote: "Anthropic strongly recommends XML tags to prevent prompt injection and avoid confusing input data with instructions.",
  },
  {
    id: "rubric",
    name: "3. Acceptance Criteria & Rubric",
    category: "Acceptance Criteria",
    description: "Explicitly defines Pass/Fail conditions and guidance on handling missing or ambiguous data.",
    codeSnippet: `<acceptance_criteria>
  1. Explicitly cite the policy ID for each finding.
  2. If evidence is insufficient, state "INSUFFICIENT_EVIDENCE" — do not guess or extrapolate.
  3. Classify risk level strictly into: LOW, MEDIUM, HIGH, or CRITICAL.
</acceptance_criteria>`,
    clarityBoost: 25,
    hallucinationReduction: 35,
    parsabilityScore: 25,
    examNote: "Instructing Claude to say 'I don't know' or 'insufficient evidence' is the single most effective hallucination defense.",
  },
  {
    id: "few-shot",
    name: "4. Few-Shot Exemplars",
    category: "Standard Examples",
    description: "Provides 1–3 diverse input/output examples demonstrating exact reasoning and formatting.",
    codeSnippet: `<examples>
  <example>
    <input>Data transferred to US cloud without sign-off.</input>
    <output>{"risk": "HIGH", "policy": "POL-2026-A", "action": "HALT_TRANSFER"}</output>
  </example>
</examples>`,
    clarityBoost: 20,
    hallucinationReduction: 15,
    parsabilityScore: 25,
    examNote: "Few-shot examples are the most reliable technique for ensuring strict compliance with complex schemas.",
  },
  {
    id: "prefill",
    name: "5. Output Prefill / Assistant Prefill",
    category: "Output Format Lock",
    description: "Starts the Assistant message with opening characters (e.g. { or <audit_report>) to enforce syntax.",
    codeSnippet: `// Assistant message prefill:
{
  "audit_status": "COMPLETED",
  "findings": [`,
    clarityBoost: 10,
    hallucinationReduction: 5,
    parsabilityScore: 15,
    examNote: "Prefilling the assistant turn compels Claude to proceed immediately with valid syntax without conversational preambles.",
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
          <h3 className="wb-title">Workbench: Anthropic Multi-Layer Prompt Architecture</h3>
        </div>
        <p className="wb-intro">{intro}</p>
      </div>

      {/* Layer Toggles */}
      <div className="wb-controls" role="group" aria-label="Prompt Layers">
        <div className="wb-controls-header">
          <span className="wb-controls-title">Toggle structural prompt layers:</span>
          <div className="wb-actions">
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={selectAll}
            >
              Enable all layers (Full Stack)
            </button>
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={resetLayers}
            >
              Reset defaults
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
            <span>Clarity & Specificity</span>
          </div>
          <div className="wb-meter-wrap">
            <div className="wb-meter-bar" style={{ width: `${totalClarity}%` }} />
          </div>
          <div className="wb-metric-score">{totalClarity}%</div>
        </div>

        <div className="wb-metric-card">
          <div className="wb-metric-head">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Hallucination Resistance</span>
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
            <span>Structural Parsability</span>
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
            <span>Assembled Prompt Preview ({activeLayerIds.length} layers active)</span>
          </div>
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={() => setShowFullCode(!showFullCode)}
          >
            <Eye size={12} aria-hidden="true" />
            {showFullCode ? "Collapse code" : "Expand full code"}
          </button>
        </div>
        <pre
          className={`wb-code-block ${showFullCode ? "wb-code-block--expanded" : ""}`}
          tabIndex={0}
          aria-label="Assembled prompt preview"
        >
          <code>{assembledPrompt || "// No layers selected. Enable at least one layer above."}</code>
        </pre>
      </div>

      {/* Exam Takeaway Note */}
      <div className="wb-takeaway">
        <strong>Core Principle for CCAO-F (Domain 1):</strong>
        <p>
          Anthropic emphasizes that effective prompting is not about composing unstructured, winding text—it is about disciplined structural layering.
          Combining XML delimiter tags with explicit acceptance criteria and few-shot exemplars produces consistent, trustworthy output ready for software integration.
        </p>
      </div>
    </figure>
  );
}
