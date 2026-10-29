import { Flag } from "lucide-react";
import type { QuestionOutcome, TimedExamSession } from "../../../domain";

interface QuestionNavigatorProps {
  session: TimedExamSession;
  currentIndex: number;
  mode: "exam" | "review";
  /** Per-question outcomes in attempt order, available after submission. */
  outcomes?: readonly QuestionOutcome[];
  filteredIndices?: readonly number[];
  onSelect: (index: number) => void;
}

function stateLabel(
  answered: boolean,
  flagged: boolean,
  outcome: QuestionOutcome | undefined,
  mode: "exam" | "review",
): string {
  const parts: string[] = [];

  if (mode === "review" && outcome !== undefined) {
    parts.push(outcome === "correct" ? "correct" : outcome === "incorrect" ? "incorrect" : "unanswered");
  } else {
    parts.push(answered ? "answered" : "unanswered");
  }

  if (flagged) {
    parts.push("flagged");
  }

  return parts.join(", ");
}

export function QuestionNavigator({
  session,
  currentIndex,
  mode,
  outcomes,
  filteredIndices,
  onSelect,
}: QuestionNavigatorProps) {
  return (
    <div className="timed-navigator-panel">
      <div className="timed-navigator-head">
        <h3 className="timed-navigator-title">Question navigator</h3>
        <span className="timed-navigator-count">
          {session.questionIds.length} questions
        </span>
      </div>

      <nav className="assessment-navigator timed-navigator" aria-label="Timed exam question navigator">
        {session.questionIds.map((questionId, index) => {
          const answered = (session.session.answers[questionId]?.length ?? 0) > 0;
          const flagged = session.session.flaggedQuestionIds.includes(questionId);
          const outcome = outcomes?.[index];
          const isFilteredOut = filteredIndices !== undefined && !filteredIndices.includes(index);
          const state =
            mode === "review" && outcome !== undefined
              ? outcome
              : answered
                ? "answered"
                : "unanswered";
          const label = stateLabel(answered, flagged, outcome, mode);

          return (
            <button
              type="button"
              key={questionId}
              className="assessment-nav-button timed-nav-button"
              data-state={state}
              data-filtered-out={isFilteredOut ? "true" : undefined}
              data-current={index === currentIndex ? "true" : undefined}
              aria-current={index === currentIndex ? "step" : undefined}
              aria-label={`Question ${index + 1}, ${label}${index === currentIndex ? ", current" : ""}`}
              onClick={() => onSelect(index)}
            >
              {index + 1}
              {flagged ? (
                <Flag
                  className="timed-nav-flag"
                  size={9}
                  strokeWidth={2.4}
                  aria-hidden="true"
                />
              ) : null}
            </button>
          );
        })}
      </nav>

      <ul className="timed-legend" aria-label="Question status legend">
        <li className="timed-legend-item">
          <span className="timed-legend-swatch" data-kind="current" aria-hidden="true" />
          Current
        </li>
        {mode === "review" ? (
          <>
            <li className="timed-legend-item">
              <span className="timed-legend-swatch" data-kind="correct" aria-hidden="true" />
              Correct
            </li>
            <li className="timed-legend-item">
              <span className="timed-legend-swatch" data-kind="incorrect" aria-hidden="true" />
              Incorrect
            </li>
            <li className="timed-legend-item">
              <span className="timed-legend-swatch" data-kind="unanswered" aria-hidden="true" />
              Unanswered
            </li>
          </>
        ) : (
          <>
            <li className="timed-legend-item">
              <span className="timed-legend-swatch" data-kind="answered" aria-hidden="true" />
              Answered
            </li>
            <li className="timed-legend-item">
              <span className="timed-legend-swatch" data-kind="unanswered" aria-hidden="true" />
              Unanswered
            </li>
          </>
        )}
        <li className="timed-legend-item">
          <Flag size={10} strokeWidth={2.4} aria-hidden="true" />
          Flagged
        </li>
      </ul>
    </div>
  );
}
