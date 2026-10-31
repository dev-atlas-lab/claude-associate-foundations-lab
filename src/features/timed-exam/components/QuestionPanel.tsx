import { Flag, X } from "lucide-react";
import type { RefObject } from "react";
import { Link } from "react-router-dom";
import type {
  Question,
  QuestionOutcome,
  Source,
} from "../../../domain";

export interface QuestionPanelCurriculumContext {
  domainCode: string;
  domainTitle: string;
  objectiveStatement: string;
  lessonId?: string;
  lessonTitle?: string;
  practiceSetId?: string;
}

interface QuestionPanelProps {
  question: Question;
  index: number;
  total: number;
  selectedChoiceIds: readonly string[];
  flagged: boolean;
  mode: "exam" | "review";
  outcome?: QuestionOutcome;
  onToggleChoice?: (choiceId: string) => void;
  onToggleFlag?: () => void;
  headingRef?: RefObject<HTMLLegendElement | null>;
  sources?: readonly Source[];
  curriculumContext?: QuestionPanelCurriculumContext;
}

function optionLetters(index: number): string {
  return String.fromCharCode(65 + index);
}

function outcomeLabel(outcome: QuestionOutcome | undefined): string {
  if (outcome === "correct") {
    return "Correct";
  }

  if (outcome === "incorrect") {
    return "Incorrect";
  }

  if (outcome === "unanswered") {
    return "Unanswered";
  }

  return "";
}

export function QuestionPanel({
  question,
  index,
  total,
  selectedChoiceIds,
  flagged,
  mode,
  outcome,
  onToggleChoice,
  onToggleFlag,
  headingRef,
  sources = [],
  curriculumContext,
}: QuestionPanelProps) {
  const review = mode === "review";
  const answered = selectedChoiceIds.length > 0;

  const optionState = (choiceId: string): "correct" | "incorrect" | undefined => {
    if (!review) {
      return undefined;
    }

    if (question.correctChoiceIds.includes(choiceId)) {
      return "correct";
    }

    if (selectedChoiceIds.includes(choiceId)) {
      return "incorrect";
    }

    return undefined;
  };

  const optionNote = (choiceId: string): string | undefined => {
    if (!review) {
      return undefined;
    }

    const selected = selectedChoiceIds.includes(choiceId);
    const correct = question.correctChoiceIds.includes(choiceId);

    if (selected && correct) {
      return "Your answer · Correct answer";
    }

    if (correct) {
      return "Correct answer";
    }

    if (selected) {
      return "Your answer";
    }

    return undefined;
  };

  return (
    <section className="assessment-question timed-question" aria-labelledby="timed-question-title">
      <div className="assessment-question-meta">
        <span className="assessment-question-count">
          Question {index + 1} of {total}
        </span>
        <span
          className="assessment-answer-state"
          data-state={answered ? "answered" : "unanswered"}
        >
          {answered ? "Answered" : "Not answered"}
        </span>
        {review && outcome !== undefined ? (
          <span className="timed-outcome" data-outcome={outcome}>
            {outcomeLabel(outcome)}
          </span>
        ) : null}
        {review ? (
          flagged ? (
            <span className="assessment-flagged">
              <Flag size={11} strokeWidth={2.2} aria-hidden="true" /> Flagged
            </span>
          ) : null
        ) : (
          <button
            type="button"
            className="button button--ghost button--sm assessment-flag"
            aria-pressed={flagged}
            onClick={onToggleFlag}
          >
            <Flag size={13} strokeWidth={2} aria-hidden="true" />
            {flagged ? "Unflag question" : "Flag question"}
          </button>
        )}
      </div>

      <form
        className="quiz assessment-quiz"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <fieldset className="fieldset">
          <legend
            className="quiz-legend"
            id="timed-question-title"
            lang="en"
            tabIndex={-1}
            ref={headingRef}
          >
            {question.stem}
          </legend>
          <p className="quiz-instruction" lang="en">
            {question.type === "multiple-response"
              ? "Select all answers that apply."
              : "Select one answer."}
          </p>

          <div className="quiz-options">
            {question.choices.map((choice) => (
              <label className="quiz-option" key={choice.id} data-state={optionState(choice.id)}>
                <input
                  type={question.type === "multiple-response" ? "checkbox" : "radio"}
                  name={`timed-${question.id}`}
                  value={choice.id}
                  checked={selectedChoiceIds.includes(choice.id)}
                  onChange={() => onToggleChoice?.(choice.id)}
                  disabled={review}
                />
                <span className="quiz-option-body">
                  <span className="quiz-option-label" lang="en">
                    {choice.text}
                  </span>
                  {optionNote(choice.id) ? (
                    <span className="quiz-option-note" lang="en">
                      {optionNote(choice.id)}
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {review && outcome !== undefined ? (
          <div
            className="quiz-feedback"
            data-result={outcome === "correct" ? "correct" : "incorrect"}
          >
            <p className="quiz-feedback-title">
              {outcome === "correct" ? (
                <>
                  <span aria-hidden="true">✓</span> Correct
                </>
              ) : outcome === "unanswered" ? (
                <>
                  <span aria-hidden="true">–</span> Unanswered
                </>
              ) : (
                <>
                  <X size={16} strokeWidth={2.2} aria-hidden="true" /> Incorrect
                </>
              )}
            </p>
            <p className="quiz-feedback-text">
              {outcome === "unanswered"
                ? "No answer was selected for this question. The correct option is highlighted above and the question counts as incorrect."
                : question.correctExplanation}
            </p>
            <ul className="quiz-explanations">
              {question.choices.map((choice, choiceIndex) => (
                <li className="quiz-explanation" key={choice.id}>
                  <span className="quiz-explanation-key">
                    {optionLetters(choiceIndex)}.{" "}
                    {question.correctChoiceIds.includes(choice.id)
                      ? "Correct answer"
                      : "Why this is incorrect"}
                  </span>
                  <span className="quiz-explanation-text">{choice.explanation}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </form>

      {review && curriculumContext ? (
        <div className="question-curriculum-context">
          <h4 className="question-context-title">Related objective & lesson</h4>
          <p className="question-context-meta">
            <span className="data-table-code">D{curriculumContext.domainCode}</span>{" "}
            <strong>
              Domain {curriculumContext.domainCode}: {curriculumContext.domainTitle}
            </strong>{" "}
            — <span lang="en">{curriculumContext.objectiveStatement}</span>
          </p>
          <div className="question-context-links">
            {curriculumContext.lessonId && curriculumContext.lessonTitle ? (
              <Link className="inline-link" to={`/learn/${curriculumContext.lessonId}`}>
                Review lesson: {curriculumContext.lessonTitle}
              </Link>
            ) : null}
            {curriculumContext.practiceSetId ? (
              <Link
                className="inline-link"
                to={`/practice?set=${encodeURIComponent(curriculumContext.practiceSetId)}`}
              >
                Practice Domain {curriculumContext.domainCode}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {review && sources.length > 0 ? (
        <div className="timed-sources">
          <h4 className="timed-sources-title">Reference sources</h4>
          <ul className="timed-source-list">
            {sources.map((source) => (
              <li className="timed-source" key={source.id}>
                <a className="inline-link" href={source.url} target="_blank" rel="noreferrer">
                  {source.title}
                </a>
                <span className="timed-source-meta">
                  {source.publisher} · accessed {source.accessedAt}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
