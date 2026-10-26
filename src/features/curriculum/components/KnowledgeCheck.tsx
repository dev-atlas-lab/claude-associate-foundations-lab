import { Check, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { KnowledgeCheck as KnowledgeCheckData } from "../types";

export function KnowledgeCheck({ check }: { check: KnowledgeCheckData }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const isCorrect = submitted && selectedId === check.correctOptionId;

  useEffect(() => {
    if (submitted) {
      feedbackRef.current?.focus();
    }
  }, [submitted]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedId || submitted) {
      return;
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedId(null);
    setSubmitted(false);
  };

  return (
    <form className="quiz" onSubmit={handleSubmit} aria-labelledby="lesson-check-title">
      <fieldset className="fieldset">
        <legend className="quiz-legend" lang="en">
          {check.question}
        </legend>
        <div className="quiz-options">
          {check.options.map((option) => {
            const state = !submitted
              ? undefined
              : option.id === check.correctOptionId
                ? "correct"
                : option.id === selectedId
                  ? "incorrect"
                  : undefined;

            return (
              <label className="quiz-option" key={option.id} data-state={state}>
                <input
                  type="radio"
                  name="knowledge-check"
                  value={option.id}
                  checked={selectedId === option.id}
                  onChange={() => setSelectedId(option.id)}
                  disabled={submitted}
                />
                <span className="quiz-option-body">
                  <span className="quiz-option-label" lang="en">
                    {option.text}
                  </span>
                  {state ? (
                    <span className="quiz-option-note">
                      {state === "correct" ? "Correct answer" : "Your answer"}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="quiz-actions">
        <button
          type="submit"
          className="button button--primary"
          disabled={!selectedId || submitted}
        >
          Check answer
        </button>
        {submitted ? (
          <button type="button" className="button button--ghost" onClick={handleReset}>
            <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
            Try again
          </button>
        ) : (
          <span className="quiz-hint">Select one option, then check your answer.</span>
        )}
      </div>

      {submitted ? (
        <div
          ref={feedbackRef}
          className="quiz-feedback"
          data-result={isCorrect ? "correct" : "incorrect"}
          role="status"
          tabIndex={-1}
        >
          <p className="quiz-feedback-title">
            {isCorrect ? (
              <>
                <Check size={16} strokeWidth={2.2} aria-hidden="true" />
                Chính xác
              </>
            ) : (
              <>
                <X size={16} strokeWidth={2.2} aria-hidden="true" />
                Chưa đúng
              </>
            )}
          </p>
          <p className="quiz-feedback-text">{check.correctExplanation}</p>
          <ul className="quiz-explanations">
            {check.options.map((option, index) => (
              <li className="quiz-explanation" key={option.id}>
                <span className="quiz-explanation-key">
                  {String.fromCharCode(65 + index)}.{" "}
                  {option.id === check.correctOptionId ? "Đáp án đúng" : "Vì sao không chọn"}
                </span>
                <span className="quiz-explanation-text">{option.explanation}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
