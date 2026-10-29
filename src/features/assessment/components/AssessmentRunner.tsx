import { ArrowLeft, ArrowRight, Flag, Play, RotateCcw, Shuffle, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useInRouterContext } from "react-router-dom";
import {
  getQuestionCurriculumContext,
  getSources,
  primaryBlueprint,
  questionBankEntries,
} from "../../../content";
import {
  calculateAssessmentResult,
  createAssessmentContext,
  goToNextQuestion,
  goToPreviousQuestion,
  goToQuestion,
  shuffleQuestionIds,
  startAssessment,
  submitAssessment,
  toggleAnswerChoice,
  toggleQuestionFlag,
  type AssessmentDefinition,
  type AssessmentSession,
  type Question,
} from "../../../domain";
import { createId } from "../../../lib/ids";
import {
  deriveAttemptDomainBreakdown,
  deriveAttemptObjectiveBreakdown,
} from "../../progress/selectors";

interface AssessmentRunnerProps {
  definition: AssessmentDefinition;
  questions: readonly Question[];
  /** Resume an existing attempt instead of showing the start screen. */
  initialSession?: AssessmentSession;
  /** Question ordering snapshot for initialSession when resuming a shuffled attempt. */
  initialQuestionIds?: readonly string[];
  /** Create and persist a new attempt. Return null when starting is blocked. */
  onStart?: (
    attemptDefinition?: AssessmentDefinition,
    sessionId?: string,
  ) => AssessmentSession | null;
  /** Called for in-progress changes and the transition to submitted. */
  onSessionChange?: (session: AssessmentSession) => void;
  persisted?: boolean;
  allowNewAttempt?: boolean;
}

function optionLetters(index: number): string {
  return String.fromCharCode(65 + index);
}

function SafeLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) {
  const inRouter = useInRouterContext();

  if (inRouter) {
    return (
      <Link className={className} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <a className={className} href={to}>
      {children}
    </a>
  );
}

export function AssessmentRunner({
  definition,
  questions,
  initialSession,
  initialQuestionIds,
  onStart,
  onSessionChange,
  persisted = false,
  allowNewAttempt = true,
}: AssessmentRunnerProps) {
  const [activeQuestionIds, setActiveQuestionIds] = useState<readonly string[]>(() =>
    initialQuestionIds && initialQuestionIds.length === definition.questionIds.length
      ? [...initialQuestionIds]
      : definition.questionIds,
  );
  const activeDefinition = useMemo<AssessmentDefinition>(
    () => ({
      ...definition,
      questionIds: [...activeQuestionIds],
    }),
    [definition, activeQuestionIds],
  );
  const isShuffledOrder = useMemo(
    () =>
      activeDefinition.questionIds.length === definition.questionIds.length &&
      activeDefinition.questionIds.some(
        (questionId, index) => questionId !== definition.questionIds[index],
      ),
    [activeDefinition.questionIds, definition.questionIds],
  );
  const context = useMemo(
    () => createAssessmentContext(activeDefinition, questions),
    [activeDefinition, questions],
  );
  const [session, setSession] = useState<AssessmentSession | null>(initialSession ?? null);
  const [confirming, setConfirming] = useState(false);
  const questionHeadingRef = useRef<HTMLLegendElement>(null);
  const confirmationRef = useRef<HTMLElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const wasConfirmingRef = useRef(false);
  const onSessionChangeRef = useRef(onSessionChange);
  const lastSavedStatusRef = useRef<AssessmentSession["status"] | undefined>(
    initialSession?.status,
  );

  useEffect(() => {
    onSessionChangeRef.current = onSessionChange;
  }, [onSessionChange]);

  const sessionId = session?.id;
  const sessionStatus = session?.status;
  const currentQuestionIndex = session?.currentQuestionIndex;
  const result =
    session !== null && session.status === "submitted"
      ? calculateAssessmentResult(context, session)
      : null;
  const currentQuestionId =
    session === null ? undefined : activeDefinition.questionIds[session.currentQuestionIndex];
  const currentQuestion =
    currentQuestionId === undefined ? undefined : context.questionById.get(currentQuestionId);
  const currentScore =
    result === null || session === null ? undefined : result.questions[session.currentQuestionIndex];
  const selectedChoiceIds =
    session !== null && currentQuestionId !== undefined
      ? (session.answers[currentQuestionId] ?? [])
      : [];
  const isFlagged =
    session !== null && currentQuestionId !== undefined
      ? session.flaggedQuestionIds.includes(currentQuestionId)
      : false;
  const answeredCount =
    session === null
      ? 0
      : activeDefinition.questionIds.filter(
          (questionId) => (session.answers[questionId]?.length ?? 0) > 0,
        ).length;
  const unansweredCount = activeDefinition.questionIds.length - answeredCount;
  const isFirstQuestion = session !== null && session.currentQuestionIndex === 0;
  const isLastQuestion =
    session !== null &&
    session.currentQuestionIndex === activeDefinition.questionIds.length - 1;

  useEffect(() => {
    if (sessionId !== undefined) {
      questionHeadingRef.current?.focus();
    }
  }, [sessionId, currentQuestionIndex]);

  useEffect(() => {
    if (confirming) {
      confirmationRef.current?.focus();
    } else if (wasConfirmingRef.current) {
      submitButtonRef.current?.focus();
    }

    wasConfirmingRef.current = confirming;
  }, [confirming]);

  useEffect(() => {
    if (sessionStatus === "submitted") {
      resultHeadingRef.current?.focus();
    }
  }, [sessionStatus]);

  useEffect(() => {
    if (session === null || onSessionChangeRef.current === undefined) {
      return;
    }

    // Persist the transition into "submitted", but do not rewrite a submitted
    // attempt when the learner only navigates through its review pages.
    if (session.status === "submitted" && lastSavedStatusRef.current === "submitted") {
      return;
    }

    lastSavedStatusRef.current = session.status;
    onSessionChangeRef.current(session);
  }, [session]);

  const beginSession = (shuffle = false) => {
    setConfirming(false);

    const nextSessionId = createId();
    const nextQuestionIds =
      shuffle && definition.questionIds.length > 1
        ? shuffleQuestionIds(definition.questionIds, nextSessionId)
        : [...definition.questionIds];
    const nextDefinition: AssessmentDefinition = {
      ...definition,
      questionIds: nextQuestionIds,
    };
    const nextContext = createAssessmentContext(nextDefinition, questions);

    const nextSession = onStart
      ? onStart(nextDefinition, nextSessionId)
      : startAssessment(nextContext, {
          sessionId: nextSessionId,
          startedAt: new Date().toISOString(),
        });

    if (nextSession === null) {
      return;
    }

    lastSavedStatusRef.current = nextSession.status;
    setActiveQuestionIds(nextQuestionIds);
    setSession(nextSession);
  };

  const handleChoiceChange = (choiceId: string) => {
    if (session === null || currentQuestion === undefined) {
      return;
    }

    setSession(toggleAnswerChoice(context, session, currentQuestion.id, choiceId));
  };

  const handleSubmit = () => {
    if (session === null) {
      return;
    }

    const outcome = submitAssessment(context, session, new Date().toISOString());
    setSession(outcome.session);
    setConfirming(false);
  };

  if (session === null) {
    return (
      <section className="assessment-start" aria-labelledby="assessment-start-title">
        <div className="assessment-start-head">
          <span className="assessment-kicker">Assessment</span>
          <h2 className="assessment-start-title" id="assessment-start-title">
            {definition.title}
          </h2>
          <p className="assessment-start-copy">{definition.description}</p>
        </div>

        <div className="assessment-meta">
          <span className="badge">
            {definition.questionIds.length} question
            {definition.questionIds.length === 1 ? "" : "s"}
          </span>
          <span className="badge">Unlimited time in this phase</span>
          <span className="badge badge--warn">Not official exam content</span>
        </div>

        <div className="assessment-instructions">
          <h3 className="assessment-instructions-title" lang="en">
            Before you start
          </h3>
          <ul className="bullet-list">
            <li>
              {definition.policy.allowAnswerChangesBeforeSubmit
                ? "You can change answers before you submit."
                : "Once you choose an answer, you cannot change it."}
            </li>
            <li>
              Single-choice questions accept one answer. Multiple-response questions need the exact
              set of correct answers — there is no partial credit.
            </li>
            <li>Unanswered questions are scored as not correct and reported separately.</li>
            <li>
              Explanations appear after submission.{" "}
              {persisted
                ? "This attempt is saved in this browser, so you can resume after a refresh."
                : "This attempt runs in memory only and is discarded on refresh."}
            </li>
          </ul>
        </div>

        <div className="assessment-actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => beginSession(false)}
          >
            <Play size={14} strokeWidth={2} aria-hidden="true" />
            Start assessment
          </button>
          {definition.questionIds.length > 1 ? (
            <button
              type="button"
              className="button button--secondary"
              onClick={() => beginSession(true)}
            >
              <Shuffle size={14} strokeWidth={2} aria-hidden="true" />
              Start shuffled
            </button>
          ) : null}
          <span className="assessment-hint">
            {persisted
              ? "Answers are saved locally after each change. You can resume or review later."
              : "This attempt runs in memory only. Refreshing the page discards it."}
          </span>
        </div>
      </section>
    );
  }

  if (currentQuestion === undefined) {
    return (
      <section className="assessment-start" aria-labelledby="assessment-broken-title">
        <h2 className="assessment-start-title" id="assessment-broken-title">
          This assessment cannot be rendered
        </h2>
        <p className="assessment-start-copy">
          The definition references no current question. Start a new attempt after the content is
          fixed.
        </p>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => beginSession(false)}
        >
          <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
          Restart
        </button>
      </section>
    );
  }

  const optionNote = (choiceId: string): string | undefined => {
    if (currentScore === undefined) {
      return undefined;
    }

    if (currentQuestion.correctChoiceIds.includes(choiceId)) {
      return "Correct answer";
    }

    if (selectedChoiceIds.includes(choiceId)) {
      return "Your answer";
    }

    return undefined;
  };

  const optionState = (choiceId: string): "correct" | "incorrect" | undefined => {
    if (currentScore === undefined) {
      return undefined;
    }

    if (currentQuestion.correctChoiceIds.includes(choiceId)) {
      return "correct";
    }

    if (selectedChoiceIds.includes(choiceId)) {
      return "incorrect";
    }

    return undefined;
  };

  const domainBreakdown =
    result === null
      ? []
      : deriveAttemptDomainBreakdown(result, questionBankEntries, primaryBlueprint);
  const objectiveBreakdown =
    result === null
      ? []
      : deriveAttemptObjectiveBreakdown(result, questionBankEntries, primaryBlueprint);
  const currentQuestionContext =
    currentScore === undefined
      ? undefined
      : getQuestionCurriculumContext(currentQuestion.id);
  const currentQuestionSources =
    currentScore === undefined
      ? []
      : currentQuestionContext !== undefined
        ? currentQuestionContext.sources
        : getSources(currentQuestion.sourceIds);

  return (
    <div className="assessment">
      <header className="assessment-header">
        <div>
          <span className="assessment-kicker">Assessment</span>
          <h2 className="assessment-title">{definition.title}</h2>
          <p className="assessment-subtitle">
            {answeredCount} of {activeDefinition.questionIds.length} answered ·{" "}
            {session.status === "submitted" ? "Submitted" : "In progress"}
            {isShuffledOrder ? " · Shuffled order" : ""}
          </p>
        </div>
        <div className="assessment-header-actions">
          {session.status === "submitted" && allowNewAttempt ? (
            <>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => beginSession(false)}
              >
                <RotateCcw size={13} strokeWidth={2} aria-hidden="true" />
                New attempt
              </button>
              {definition.questionIds.length > 1 ? (
                <button
                  type="button"
                  className="button button--secondary button--sm"
                  onClick={() => beginSession(true)}
                >
                  <Shuffle size={13} strokeWidth={2} aria-hidden="true" />
                  Shuffle & retry
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </header>

      {result !== null ? (
        <section className="assessment-result" aria-labelledby="assessment-result-title">
          <div className="assessment-result-head">
            <h3 className="assessment-result-title" id="assessment-result-title" tabIndex={-1} ref={resultHeadingRef}>
              Kết quả luyện tập
            </h3>
            <span className="assessment-result-score">{result.rawPercentage}%</span>
          </div>

          <dl className="stat-grid assessment-stats">
            <div className="stat">
              <dt className="stat-label">Tổng số câu</dt>
              <dd className="stat-value">{result.totalQuestions}</dd>
            </div>
            <div className="stat">
              <dt className="stat-label">Đã trả lời</dt>
              <dd className="stat-value">{result.answeredQuestions}</dd>
            </div>
            <div className="stat">
              <dt className="stat-label">Đúng</dt>
              <dd className="stat-value">{result.correctAnswers}</dd>
            </div>
            <div className="stat">
              <dt className="stat-label">Sai</dt>
              <dd className="stat-value">{result.incorrectAnswers}</dd>
            </div>
            <div className="stat">
              <dt className="stat-label">Chưa trả lời</dt>
              <dd className="stat-value">{result.unansweredQuestions}</dd>
            </div>
            <div className="stat">
              <dt className="stat-label">Raw percentage</dt>
              <dd className="stat-value">{result.rawPercentage}%</dd>
            </div>
          </dl>

          <p className="assessment-disclaimer">
            Raw percentage chỉ là chỉ số luyện tập. Đây không phải điểm scaled chính thức trên thang
            100–1.000 và không dự đoán kết quả thi. Mỗi câu được chấm all-or-nothing; câu chưa trả
            lời tính là sai.
          </p>

          {domainBreakdown.length > 1 ? (
            <div className="assessment-breakdown">
              <h4 className="assessment-breakdown-title">Phân tích theo official domain</h4>
              <div className="table-wrap">
                <table className="data-table">
                  <caption className="sr-only">Attempt breakdown by official domain</caption>
                  <thead>
                    <tr>
                      <th scope="col">Domain</th>
                      <th scope="col">Weight</th>
                      <th scope="col">Correct / Total</th>
                      <th scope="col">Incorrect</th>
                      <th scope="col">Unanswered</th>
                      <th scope="col">Raw %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainBreakdown.map((row) => (
                      <tr key={row.domainId}>
                        <th scope="row">
                          <span className="data-table-code">{row.code}</span> {row.title}
                          {row.lessonId || (row.practiceSetId && row.practiceSetId !== definition.id) ? (
                            <div className="table-remediation">
                              {row.lessonId && row.lessonTitle ? (
                                <SafeLink className="inline-link" to={`/learn/${row.lessonId}`}>
                                  Bài học: {row.lessonTitle}
                                </SafeLink>
                              ) : null}
                              {row.practiceSetId && row.practiceSetId !== definition.id ? (
                                <SafeLink
                                  className="inline-link"
                                  to={`/practice?set=${encodeURIComponent(row.practiceSetId)}`}
                                >
                                  Luyện tập Domain {row.code}
                                </SafeLink>
                              ) : null}
                            </div>
                          ) : null}
                        </th>
                        <td>{row.weightPercent}%</td>
                        <td>
                          {row.correctAnswers}/{row.totalQuestions}
                        </td>
                        <td>{row.incorrectAnswers}</td>
                        <td>{row.unansweredQuestions}</td>
                        <td>{row.rawPercentage ?? 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : domainBreakdown.length === 1 && objectiveBreakdown.length > 0 ? (
            <div className="assessment-breakdown">
              <h4 className="assessment-breakdown-title">Phân tích theo official objective</h4>
              <div className="table-wrap">
                <table className="data-table">
                  <caption className="sr-only">Attempt breakdown by official objective</caption>
                  <thead>
                    <tr>
                      <th scope="col">Objective</th>
                      <th scope="col">Correct / Total</th>
                      <th scope="col">Incorrect</th>
                      <th scope="col">Unanswered</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {objectiveBreakdown.map((row) => (
                      <tr key={row.objectiveId}>
                        <th scope="row">
                          <span className="data-table-code">D{row.domainCode}</span> {row.statement}
                          {row.lessonId && row.lessonTitle ? (
                            <div className="table-remediation">
                              <SafeLink className="inline-link" to={`/learn/${row.lessonId}`}>
                                Bài học: {row.lessonTitle}
                              </SafeLink>
                            </div>
                          ) : null}
                        </th>
                        <td>
                          {row.correctAnswers}/{row.totalQuestions}
                        </td>
                        <td>{row.incorrectAnswers}</td>
                        <td>{row.unansweredQuestions}</td>
                        <td>
                          {row.correctAnswers === row.totalQuestions
                            ? `All correct (${row.correctAnswers}/${row.totalQuestions})`
                            : row.answeredQuestions === 0
                              ? `Unanswered (0/${row.totalQuestions})`
                              : `Needs review (${row.correctAnswers}/${row.totalQuestions})`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="assessment-question" aria-labelledby="assessment-question-title">
        <div className="assessment-question-meta">
          <span className="assessment-question-count">
            Question {session.currentQuestionIndex + 1} of {activeDefinition.questionIds.length}
          </span>
          <span
            className="assessment-answer-state"
            data-state={selectedChoiceIds.length === 0 ? "unanswered" : "answered"}
          >
            {selectedChoiceIds.length === 0 ? "Not answered" : "Answered"}
          </span>
          {session.status === "in-progress" ? (
            <button
              type="button"
              className="button button--ghost button--sm assessment-flag"
              aria-pressed={isFlagged}
              onClick={() => setSession(toggleQuestionFlag(context, session, currentQuestion.id))}
            >
              <Flag size={13} strokeWidth={2} aria-hidden="true" />
              {isFlagged ? "Unflag question" : "Flag question"}
            </button>
          ) : isFlagged ? (
            <span className="assessment-flagged">Flagged</span>
          ) : null}
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
              id="assessment-question-title"
              lang="en"
              tabIndex={-1}
              ref={questionHeadingRef}
            >
              {currentQuestion.stem}
            </legend>
            <p className="quiz-instruction" lang="en">
              {currentQuestion.type === "multiple-response"
                ? "Select all answers that apply."
                : "Select one answer."}
            </p>

            <div className="quiz-options">
              {currentQuestion.choices.map((choice) => (
                <label
                  className="quiz-option"
                  key={choice.id}
                  data-state={optionState(choice.id)}
                >
                  <input
                    type={currentQuestion.type === "multiple-response" ? "checkbox" : "radio"}
                    name={`assessment-${session.id}-${currentQuestion.id}`}
                    value={choice.id}
                    checked={selectedChoiceIds.includes(choice.id)}
                    onChange={() => handleChoiceChange(choice.id)}
                    disabled={session.status === "submitted"}
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

          {currentScore === undefined ? null : (
            <div
              className="quiz-feedback"
              data-result={currentScore.isCorrect ? "correct" : "incorrect"}
              role="status"
            >
              <p className="quiz-feedback-title">
                {currentScore.isCorrect ? (
                  <>
                    <span aria-hidden="true">✓</span> Chính xác
                  </>
                ) : currentScore.outcome === "unanswered" ? (
                  <>
                    <span aria-hidden="true">–</span> Chưa trả lời
                  </>
                ) : (
                  <>
                    <X size={16} strokeWidth={2.2} aria-hidden="true" /> Chưa đúng
                  </>
                )}
              </p>
              <p className="quiz-feedback-text">{currentQuestion.correctExplanation}</p>
              <ul className="quiz-explanations">
                {currentQuestion.choices.map((choice, index) => (
                  <li className="quiz-explanation" key={choice.id}>
                    <span className="quiz-explanation-key">
                      {optionLetters(index)}.{" "}
                      {currentQuestion.correctChoiceIds.includes(choice.id)
                        ? "Đáp án đúng"
                        : "Vì sao không chọn"}
                    </span>
                    <span className="quiz-explanation-text">{choice.explanation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        {currentScore !== undefined &&
        currentQuestionContext?.domain &&
        currentQuestionContext?.objective ? (
          <div className="question-curriculum-context">
            <h4 className="question-context-title">Mục tiêu & bài học liên quan</h4>
            <p className="question-context-meta">
              <span className="data-table-code">D{currentQuestionContext.domain.code}</span>{" "}
              <strong>
                Domain {currentQuestionContext.domain.code}: {currentQuestionContext.domain.title}
              </strong>{" "}
              — <span lang="en">{currentQuestionContext.objective.statement}</span>
            </p>
            <div className="question-context-links">
              {currentQuestionContext.lesson ? (
                <SafeLink
                  className="inline-link"
                  to={`/learn/${currentQuestionContext.lesson.id}`}
                >
                  Ôn lại bài học: {currentQuestionContext.lesson.title}
                </SafeLink>
              ) : null}
              {currentQuestionContext.practiceSet &&
              currentQuestionContext.practiceSet.assessment.id !== definition.id ? (
                <SafeLink
                  className="inline-link"
                  to={`/practice?set=${encodeURIComponent(currentQuestionContext.practiceSet.assessment.id)}`}
                >
                  Luyện tập Domain {currentQuestionContext.domain.code}
                </SafeLink>
              ) : null}
            </div>
          </div>
        ) : null}

        {currentScore !== undefined && currentQuestionSources.length > 0 ? (
          <div className="timed-sources">
            <h4 className="timed-sources-title">Nguồn tham chiếu</h4>
            <ul className="timed-source-list">
              {currentQuestionSources.map((source) => (
                <li className="timed-source" key={source.id}>
                  <a className="inline-link" href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                  </a>
                  <span className="timed-source-meta">
                    {source.publisher} · truy cập {source.accessedAt}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <nav className="assessment-pager" aria-label="Assessment questions">
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setSession(goToPreviousQuestion(context, session))}
            disabled={isFirstQuestion}
          >
            <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
            Previous
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setSession(goToNextQuestion(context, session))}
            disabled={isLastQuestion}
          >
            Next
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        </nav>
      </section>

      <nav className="assessment-navigator" aria-label="Question navigator">
        {activeDefinition.questionIds.map((questionId, index) => {
          const hasAnswer = (session.answers[questionId]?.length ?? 0) > 0;
          const flagged = session.flaggedQuestionIds.includes(questionId);
          const score = result?.questions[index];
          const state =
            session.status === "submitted" && score !== undefined
              ? score.outcome
              : hasAnswer
                ? "answered"
                : "unanswered";

          return (
            <button
              type="button"
              key={questionId}
              className="assessment-nav-button"
              data-state={state}
              data-current={index === session.currentQuestionIndex ? "true" : undefined}
              aria-current={index === session.currentQuestionIndex ? "step" : undefined}
              aria-label={`Question ${index + 1}, ${state}${flagged ? ", flagged" : ""}`}
              onClick={() => setSession(goToQuestion(context, session, index))}
            >
              {index + 1}
              {flagged ? <span className="assessment-nav-flag" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </nav>

      {session.status === "in-progress" ? (
        confirming ? (
          <section
            className="assessment-confirm"
            aria-labelledby="assessment-confirm-title"
            ref={confirmationRef}
            tabIndex={-1}
          >
            <h3 className="assessment-confirm-title" id="assessment-confirm-title">
              Submit this assessment?
            </h3>
            <p className="assessment-confirm-copy">
              {unansweredCount === 0
                ? "All questions are answered. You cannot change answers after submission."
                : `${unansweredCount} question${unansweredCount === 1 ? " is" : "s are"} unanswered and will be marked incorrect. You cannot change answers after submission.`}
            </p>
            <div className="assessment-actions">
              <button type="button" className="button button--primary" onClick={handleSubmit}>
                Confirm submission
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setConfirming(false)}
              >
                Keep working
              </button>
            </div>
          </section>
        ) : (
          <div className="assessment-actions assessment-submit-row">
            <button
              type="button"
              className="button button--primary"
              ref={submitButtonRef}
              onClick={() => setConfirming(true)}
            >
              Submit assessment
            </button>
            <span className="assessment-hint">
              {unansweredCount === 0
                ? "Submission ends this attempt."
                : `${unansweredCount} unanswered. Submission marks them incorrect.`}
            </span>
          </div>
        )
      ) : null}
    </div>
  );
}
