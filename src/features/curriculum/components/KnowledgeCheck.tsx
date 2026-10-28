import { Check, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { isAnswerCorrect, type Question } from "../../../domain";

export function KnowledgeCheck({ question }: { question: Question }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const wasSubmittedRef = useRef(false);
  const lastSelectionRef = useRef<string | undefined>(undefined);

  const isMultipleResponse = question.type === "multiple-response";
  const isCorrect = submitted && isAnswerCorrect(question, selectedIds);

  useEffect(() => {
    if (submitted) {
      wasSubmittedRef.current = true;
      feedbackRef.current?.focus();
      return;
    }

    if (wasSubmittedRef.current) {
      // "Try again" removes the focused button, so move focus back to the
      // previously selected answer instead of dropping it on <body>.
      wasSubmittedRef.current = false;
      const inputs = formRef.current?.querySelectorAll<HTMLInputElement>("input");
      const previous = Array.from(inputs ?? []).find(
        (input) => input.value === lastSelectionRef.current,
      );
      (previous ?? inputs?.[0])?.focus();
      lastSelectionRef.current = undefined;
    }
  }, [submitted]);

  const handleChoiceChange = (choiceId: string) => {
    if (submitted) {
      return;
    }

    if (isMultipleResponse) {
      setSelectedIds((current) =>
        current.includes(choiceId)
          ? current.filter((id) => id !== choiceId)
          : [...current, choiceId],
      );
      return;
    }

    setSelectedIds([choiceId]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedIds.length === 0 || submitted) {
      return;
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    lastSelectionRef.current = selectedIds[0];
    setSelectedIds([]);
    setSubmitted(false);
  };

  return (
    <form ref={formRef} className="quiz" onSubmit={handleSubmit}>
      <fieldset className="fieldset">
        <legend className="quiz-legend" id={`question-${question.id}-stem`} lang="en">
          {question.stem}
        </legend>
        <p className="quiz-instruction" lang="en">
          {isMultipleResponse ? "Select all answers that apply." : "Select one answer."}
        </p>
        <div className="quiz-options">
          {question.choices.map((choice) => {
            const isChoiceCorrect = question.correctChoiceIds.includes(choice.id);
            const isSelected = selectedIds.includes(choice.id);
            const state = !submitted
              ? undefined
              : isChoiceCorrect
                ? "correct"
                : isSelected
                  ? "incorrect"
                  : undefined;
            const note = !submitted
              ? undefined
              : isChoiceCorrect
                ? "Correct answer"
                : isSelected
                  ? "Your answer"
                  : undefined;

            return (
              <label className="quiz-option" key={choice.id} data-state={state}>
                <input
                  type={isMultipleResponse ? "checkbox" : "radio"}
                  name={`question-${question.id}`}
                  value={choice.id}
                  checked={isSelected}
                  onChange={() => handleChoiceChange(choice.id)}
                  disabled={submitted}
                />
                <span className="quiz-option-body">
                  <span className="quiz-option-label" lang="en">
                    {choice.text}
                  </span>
                  {note ? (
                    <span className="quiz-option-note" lang="en">
                      {note}
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
          disabled={selectedIds.length === 0 || submitted}
        >
          Check answer
        </button>
        {submitted ? (
          <button type="button" className="button button--ghost" onClick={handleReset}>
            <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
            Try again
          </button>
        ) : (
          <span className="quiz-hint">
            {isMultipleResponse
              ? "Select every correct option, then check your answer."
              : "Select one option, then check your answer."}
          </span>
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
          <p className="quiz-feedback-text">{question.correctExplanation}</p>
          <ul className="quiz-explanations">
            {question.choices.map((choice, index) => (
              <li className="quiz-explanation" key={choice.id}>
                <span className="quiz-explanation-key">
                  {String.fromCharCode(65 + index)}.{" "}
                  {question.correctChoiceIds.includes(choice.id)
                    ? "Đáp án đúng"
                    : "Vì sao không chọn"}
                </span>
                <span className="quiz-explanation-text">{choice.explanation}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
