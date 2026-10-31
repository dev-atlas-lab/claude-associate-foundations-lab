import { useState, type CSSProperties } from "react";

type Segment = {
  id: string;
  label: string;
  percent: number;
  color: string;
  detail: string;
  tip: string;
};

/**
 * Percentages are an illustrative split, not an Anthropic rule. The numbers
 * exist to make the "one shared budget" idea visible.
 */
const segments: Segment[] = [
  {
    id: "system",
    label: "System prompt & tool definitions",
    percent: 15,
    color: "var(--accent)",
    detail:
      "Roles, rules, and tool schemas sent on every turn. This should remain stable across calls as it holds core system boundaries and constraints.",
    tip: "Keep system instructions concise and unambiguous; avoid repeating the same rule across multiple user messages.",
  },
  {
    id: "documents",
    label: "Reference documents",
    percent: 35,
    color: "var(--info)",
    detail:
      "Reference documents, PDFs, data tables, or retrieval payloads. This section expands rapidly when dumping uncurated sources into the request.",
    tip: "Inject only relevant excerpted chunks; label or number sources so Claude can cite them directly.",
  },
  {
    id: "history",
    label: "Conversation history",
    percent: 20,
    color: "var(--ok)",
    detail:
      "Cumulative prior messages in the conversation thread. Excessive history inflates token costs and can dilute attention away from core rules.",
    tip: "Summarize previous discussion turns or trigger compaction when sessions become prolonged.",
  },
  {
    id: "question",
    label: "Current question",
    percent: 5,
    color: "var(--warn)",
    detail:
      "The current query or task instruction. If buried in the middle of sprawling reference text, the model may drift or miss key nuances.",
    tip: "Place the specific question or prompt command at the bottom of the prompt, right before Claude's turn.",
  },
  {
    id: "output",
    label: "Reserved for output",
    percent: 25,
    color: "var(--accent-strong)",
    detail:
      "Input and output share the single unified context window. Reserving sufficient headroom determines how much space Claude has to reason and complete the answer.",
    tip: "Budget for output generation before packing documents; setting a high max_tokens does not expand total window capacity.",
  },
];

export function ContextWindowDiagram({ intro }: { intro: string }) {
  const [activeId, setActiveId] = useState(segments[0].id);
  const active = segments.find((segment) => segment.id === activeId) ?? segments[0];

  return (
    <figure className="diagram">
      <div className="diagram-bar" aria-hidden="true">
        {segments.map((segment) => (
          <span
            key={segment.id}
            className="diagram-seg"
            data-active={segment.id === activeId}
            style={
              {
                "--seg-color": segment.color,
                width: `${segment.percent}%`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="diagram-legend" role="group" aria-label="Context budget parts">
        {segments.map((segment) => (
          <button
            key={segment.id}
            type="button"
            className="diagram-legend-item"
            aria-pressed={segment.id === activeId}
            onClick={() => setActiveId(segment.id)}
            style={{ "--seg-color": segment.color } as CSSProperties}
          >
            <span className="diagram-swatch" aria-hidden="true" />
            <span className="diagram-legend-label">{segment.label}</span>
            <span className="diagram-legend-value">{segment.percent}%</span>
          </button>
        ))}
      </div>

      <div className="diagram-detail" aria-live="polite">
        <h3 className="diagram-detail-title">{active.label}</h3>
        <p className="diagram-detail-text">{active.detail}</p>
        <p className="diagram-tip">
          <strong>Practice tip</strong>
          {active.tip}
        </p>
      </div>

      <figcaption>{intro}</figcaption>
    </figure>
  );
}
