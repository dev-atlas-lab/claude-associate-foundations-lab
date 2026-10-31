import { ArrowLeft, ArrowRight, Clock, Gauge, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import {
  countTimedExamAnswers,
  getTimedExamResult,
  type AssessmentContext,
  type TimedExamSession,
} from "../../../domain";
import {
  getQuestionBankEntry,
  getQuestionCurriculumContext,
  getSources,
  primaryBlueprint,
  questionBankEntries,
} from "../../../content";
import { deriveAttemptDomainBreakdown } from "../../progress/selectors";
import {
  formatLocalTimestamp,
} from "../format";
import { QuestionNavigator } from "./QuestionNavigator";
import { QuestionPanel } from "./QuestionPanel";

interface TimedExamResultViewProps {
  session: TimedExamSession;
  context: AssessmentContext;
  onDiscard: () => { ok: boolean; message?: string };
}

export type TimedReviewFilter = "all" | "incorrect" | "unanswered" | "flagged" | "correct";

export function TimedExamResultView({
  session,
  context,
  onDiscard,
}: TimedExamResultViewProps) {
  const result = getTimedExamResult(session);
  const counts = countTimedExamAnswers(session);
  const [reviewFilter, setReviewFilter] = useState<TimedReviewFilter>("all");
  const [index, setIndex] = useState(() =>
    Math.min(session.session.currentQuestionIndex, session.questionIds.length - 1),
  );
  const [confirmingNew, setConfirmingNew] = useState(false);
  const [discardError, setDiscardError] = useState<string>();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const headingRef = useRef<HTMLLegendElement>(null);
  const firstQuestionRenderRef = useRef(true);
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
  const newExamButtonRef = useRef<HTMLButtonElement>(null);
  const wasConfirmingRef = useRef(false);

  useEffect(() => {
    resultHeadingRef.current?.focus();
  }, []);

  useEffect(() => {
    if (firstQuestionRenderRef.current) {
      firstQuestionRenderRef.current = false;
      return;
    }

    headingRef.current?.focus();
  }, [index]);

  useEffect(() => {
    if (confirmingNew) {
      confirmHeadingRef.current?.focus();
    } else if (wasConfirmingRef.current) {
      newExamButtonRef.current?.focus();
    }

    wasConfirmingRef.current = confirmingNew;
  }, [confirmingNew]);

  const questionId = session.questionIds[index];
  const question = questionId === undefined ? undefined : context.questionById.get(questionId);
  const score = result.questions[index];
  const submissionReason = session.submissionReason ?? "user";
  const bankEntry = question === undefined ? undefined : getQuestionBankEntry(question.id);
  const questionContext =
    question === undefined ? undefined : getQuestionCurriculumContext(question.id);
  const domainBreakdown = deriveAttemptDomainBreakdown(
    result,
    questionBankEntries,
    primaryBlueprint,
  );
  const sourceIds =
    question === undefined
      ? []
      : [
          ...new Set([
            ...question.sourceIds,
            ...(bankEntry?.verification.sourceIds ?? []),
          ]),
        ];
  const sources = getSources(sourceIds);

  // ── Pacing Analytics ──────────────────────────────────────────────────────────
  const startMs = new Date(session.session.startedAt).getTime();
  const submitMs = new Date(result.submittedAt).getTime();
  const totalElapsedSec =
    Number.isNaN(startMs) || Number.isNaN(submitMs)
      ? 0
      : Math.max(0, Math.floor((submitMs - startMs) / 1000));
  const totalMinutes = Math.floor(totalElapsedSec / 60);
  const remainingSec = totalElapsedSec % 60;
  const avgSecPerQuestion =
    result.totalQuestions > 0 ? Math.round(totalElapsedSec / result.totalQuestions) : 0;
  const avgMin = Math.floor(avgSecPerQuestion / 60);
  const avgSec = avgSecPerQuestion % 60;

  let pacingTone: "ok" | "warn" | "neutral" | "accent" = "accent";
  let pacingTitle = "Target pace (~2 min/item)";
  let pacingAdvice =
    "You maintained a very balanced pace, closely matching the 120-minute allowance for 60 questions on the CCAO-F exam.";

  if (avgSecPerQuestion > 0 && avgSecPerQuestion < 105) {
    pacingTone = "ok";
    pacingTitle = "Fast pace (<1m45s/item)";
    pacingAdvice =
      "You finished at a fast pace. Use extra time to thoroughly review multi-step scenario questions.";
  } else if (avgSecPerQuestion > 135) {
    pacingTone = "warn";
    pacingTitle = "Slow pace (>2m15s/item) — Time risk";
    pacingAdvice =
      "In the real exam, solve quick concept questions rapidly (1–1.5 min) and flag complex scenarios to revisit later, avoiding late-exam time pressure.";
  }

  // ── Review Filter Indices ───────────────────────────────────────────────────
  const filteredIndices = session.questionIds
    .map((qId, i) => {
      const outcome = result.questions[i]?.outcome;
      const isFlagged = session.session.flaggedQuestionIds.includes(qId);
      if (reviewFilter === "incorrect") return outcome === "incorrect" ? i : -1;
      if (reviewFilter === "unanswered") return outcome === "unanswered" ? i : -1;
      if (reviewFilter === "flagged") return isFlagged ? i : -1;
      if (reviewFilter === "correct") return outcome === "correct" ? i : -1;
      return i;
    })
    .filter((i) => i !== -1);

  const currentFilteredPos = filteredIndices.indexOf(index);
  const hasPrev = reviewFilter === "all" ? index > 0 : currentFilteredPos > 0;
  const hasNext =
    reviewFilter === "all"
      ? index < session.questionIds.length - 1
      : currentFilteredPos !== -1 && currentFilteredPos < filteredIndices.length - 1;

  const handlePrev = () => {
    if (reviewFilter === "all") {
      setIndex((curr) => Math.max(0, curr - 1));
    } else if (hasPrev) {
      setIndex(filteredIndices[currentFilteredPos - 1]!);
    }
  };

  const handleNext = () => {
    if (reviewFilter === "all") {
      setIndex((curr) => Math.min(session.questionIds.length - 1, curr + 1));
    } else if (hasNext) {
      setIndex(filteredIndices[currentFilteredPos + 1]!);
    }
  };

  const handleDiscard = () => {
    const outcome = onDiscard();

    if (!outcome.ok) {
      setDiscardError(outcome.message ?? "The saved timed exam could not be discarded.");
      return;
    }

    document.getElementById("main-content")?.focus({ preventScroll: true });
  };

  if (question === undefined || score === undefined) {
    return (
      <section className="assessment-start" aria-labelledby="timed-review-broken-title">
        <h2 className="assessment-start-title" id="timed-review-broken-title">
          This result cannot be reviewed
        </h2>
        <p className="assessment-start-copy">
          A reviewed question is missing from the current content registry. The saved raw result is
          unchanged and is not recalculated.
        </p>
      </section>
    );
  }

  return (
    <div className="assessment timed-result-view">
      <section className="assessment-result timed-result" aria-labelledby="timed-result-title">
        <div className="assessment-result-head">
          <div>
            <h2
              className="assessment-result-title"
              id="timed-result-title"
              tabIndex={-1}
              ref={resultHeadingRef}
            >
              Timed exam results
            </h2>
            <p className="timed-submission" data-reason={submissionReason}>
              {submissionReason === "time-expired" ? (
                <>
                  <Clock size={13} strokeWidth={2} aria-hidden="true" />
                  <span className="badge badge--warn">Automatic expiry</span>
                  Time expired — exam automatically submitted at the deadline.
                </>
              ) : (
                <>
                  <span className="badge badge--ok">Manual submission</span>
                  You manually submitted your exam before the time limit.
                </>
              )}
              <span className="timed-submission-time">
                Submitted at <time dateTime={result.submittedAt}>{formatLocalTimestamp(result.submittedAt)}</time>
              </span>
            </p>
          </div>
          <span className="assessment-result-score">{result.rawPercentage}%</span>
        </div>

        <dl className="stat-grid assessment-stats">
          <div className="stat">
            <dt className="stat-label">Total questions</dt>
            <dd className="stat-value">{result.totalQuestions}</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Answered</dt>
            <dd className="stat-value">{result.answeredQuestions}</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Correct</dt>
            <dd className="stat-value">{result.correctAnswers}</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Incorrect</dt>
            <dd className="stat-value">{result.incorrectAnswers}</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Unanswered</dt>
            <dd className="stat-value">{result.unansweredQuestions}</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Flagged</dt>
            <dd className="stat-value">{counts.flagged}</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Raw percentage</dt>
            <dd className="stat-value">{result.rawPercentage}%</dd>
          </div>
        </dl>

        <p className="assessment-disclaimer">
          This is a raw performance score from a timed simulation, not an official scaled score on the 100–1,000 scale and not a pass/fail prediction. Each question is scored on the exact set with all-or-nothing grading; unanswered items count as incorrect and are reported separately. No partial credit.
        </p>

        {/* ── Pacing / Time Analysis Section ─────────────────────────────────── */}
        <div className="timed-pacing-panel">
          <div className="timed-pacing-head">
            <div className="timed-pacing-title-wrap">
              <Gauge size={16} className="text-accent" aria-hidden="true" />
              <h3 className="timed-pacing-title">Pacing analysis</h3>
            </div>
            <Badge tone={pacingTone}>{pacingTitle}</Badge>
          </div>

          <div className="timed-pacing-grid">
            <div className="timed-pacing-stat">
              <span className="timed-pacing-stat-label">Elapsed time</span>
              <span className="timed-pacing-stat-value">
                {totalMinutes}m {remainingSec}s / 120m
              </span>
              <span className="timed-pacing-stat-hint">
                {Math.round((totalElapsedSec / (120 * 60)) * 100)}% of total allowed time
              </span>
            </div>

            <div className="timed-pacing-stat">
              <span className="timed-pacing-stat-label">Average pace per item</span>
              <span className="timed-pacing-stat-value">
                {avgMin}m {avgSec}s / item
              </span>
              <span className="timed-pacing-stat-hint">
                Target benchmark: 2m 00s / item
              </span>
            </div>

            <div className="timed-pacing-stat">
              <span className="timed-pacing-stat-label">Pacing evaluation</span>
              <span className="timed-pacing-stat-value">{pacingTitle}</span>
              <span className="timed-pacing-stat-hint">{pacingAdvice}</span>
            </div>
          </div>
        </div>

        {domainBreakdown.length > 0 ? (
          <div className="assessment-breakdown">
            <h3 className="assessment-breakdown-title">Breakdown by official domain</h3>
            <div className="table-wrap">
              <table className="data-table">
                <caption className="sr-only">Timed exam performance by official domain</caption>
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
                        {row.lessonId || row.practiceSetId ? (
                          <div className="table-remediation">
                            {row.lessonId && row.lessonTitle ? (
                              <Link className="inline-link" to={`/learn/${row.lessonId}`}>
                                Lesson: {row.lessonTitle}
                              </Link>
                            ) : null}
                            {row.practiceSetId ? (
                              <Link
                                className="inline-link"
                                to={`/practice?set=${encodeURIComponent(row.practiceSetId)}`}
                              >
                                Practice Domain {row.code}
                              </Link>
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
        ) : null}
      </section>

      <section className="section timed-review" aria-labelledby="timed-review-title">
        <div className="section-heading-row">
          <h3 className="section-title" id="timed-review-title">
            Review questions
          </h3>
          <span className="section-note">
            Your answers, correct answers, detailed explanations, and reference sources
          </span>
        </div>

        {/* ── Review Mode Filter Bar ────────────────────────────────────────── */}
        <div className="timed-review-filters" role="group" aria-label="Review question filters">
          <button
            type="button"
            className={`timed-filter-btn ${reviewFilter === "all" ? "timed-filter-btn--active" : ""}`}
            aria-pressed={reviewFilter === "all"}
            onClick={() => setReviewFilter("all")}
          >
            All <span className="timed-filter-count">{result.totalQuestions}</span>
          </button>
          <button
            type="button"
            className={`timed-filter-btn ${reviewFilter === "incorrect" ? "timed-filter-btn--active" : ""}`}
            aria-pressed={reviewFilter === "incorrect"}
            onClick={() => {
              setReviewFilter("incorrect");
              const first = session.questionIds.findIndex(
                (_, i) => result.questions[i]?.outcome === "incorrect",
              );
              if (first !== -1) setIndex(first);
            }}
          >
            Incorrect <span className="timed-filter-count">{result.incorrectAnswers}</span>
          </button>
          <button
            type="button"
            className={`timed-filter-btn ${reviewFilter === "unanswered" ? "timed-filter-btn--active" : ""}`}
            aria-pressed={reviewFilter === "unanswered"}
            onClick={() => {
              setReviewFilter("unanswered");
              const first = session.questionIds.findIndex(
                (_, i) => result.questions[i]?.outcome === "unanswered",
              );
              if (first !== -1) setIndex(first);
            }}
          >
            Unanswered <span className="timed-filter-count">{result.unansweredQuestions}</span>
          </button>
          <button
            type="button"
            className={`timed-filter-btn ${reviewFilter === "flagged" ? "timed-filter-btn--active" : ""}`}
            aria-pressed={reviewFilter === "flagged"}
            onClick={() => {
              setReviewFilter("flagged");
              const first = session.questionIds.findIndex((qId) =>
                session.session.flaggedQuestionIds.includes(qId),
              );
              if (first !== -1) setIndex(first);
            }}
          >
            Flagged <span className="timed-filter-count">{counts.flagged}</span>
          </button>
          <button
            type="button"
            className={`timed-filter-btn ${reviewFilter === "correct" ? "timed-filter-btn--active" : ""}`}
            aria-pressed={reviewFilter === "correct"}
            onClick={() => {
              setReviewFilter("correct");
              const first = session.questionIds.findIndex(
                (_, i) => result.questions[i]?.outcome === "correct",
              );
              if (first !== -1) setIndex(first);
            }}
          >
            Correct <span className="timed-filter-count">{result.correctAnswers}</span>
          </button>
        </div>

        <div className="timed-layout">
          <div className="timed-main">
            <QuestionPanel
              question={question}
              index={index}
              total={session.questionIds.length}
              selectedChoiceIds={score.selectedChoiceIds}
              flagged={session.session.flaggedQuestionIds.includes(question.id)}
              mode="review"
              outcome={score.outcome}
              headingRef={headingRef}
              sources={sources}
              curriculumContext={
                questionContext?.domain && questionContext?.objective
                  ? {
                      domainCode: questionContext.domain.code,
                      domainTitle: questionContext.domain.title,
                      objectiveStatement: questionContext.objective.statement,
                      lessonId: questionContext.lesson?.id,
                      lessonTitle: questionContext.lesson?.title,
                      practiceSetId: questionContext.practiceSet?.assessment.id,
                    }
                  : undefined
              }
            />

            <nav className="assessment-pager" aria-label="Timed exam review questions">
              <button
                type="button"
                className="button button--secondary"
                onClick={handlePrev}
                disabled={!hasPrev}
              >
                <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
                Previous
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={handleNext}
                disabled={!hasNext}
              >
                Next
                <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            </nav>
          </div>

          <div className="timed-aside">
            <QuestionNavigator
              session={session}
              currentIndex={index}
              mode="review"
              outcomes={result.questions.map((questionScore) => questionScore.outcome)}
              filteredIndices={reviewFilter === "all" ? undefined : filteredIndices}
              onSelect={setIndex}
            />
          </div>
        </div>
      </section>

      {discardError ? (
        <p className="study-alert" role="alert">
          {discardError}
        </p>
      ) : null}

      {confirmingNew ? (
        <section className="assessment-confirm" aria-labelledby="timed-new-exam-title">
          <h3
            className="assessment-confirm-title"
            id="timed-new-exam-title"
            tabIndex={-1}
            ref={confirmHeadingRef}
          >
            Start a new timed exam?
          </h3>
          <p className="assessment-confirm-copy">
            This discards the saved timed-exam result and returns to the instructions. Practice
            attempts and review items in <code>cfl.study.v1</code> are not affected.
          </p>
          <div className="assessment-actions">
            <button type="button" className="button button--primary" onClick={handleDiscard}>
              Discard result and continue
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setConfirmingNew(false)}
            >
              Cancel
            </button>
          </div>
        </section>
      ) : (
        <div className="assessment-actions">
          <button
            type="button"
            className="button button--secondary"
            ref={newExamButtonRef}
            onClick={() => setConfirmingNew(true)}
          >
            <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
            Start a new timed exam
          </button>
          <Link className="button button--ghost" to="/mock-exam">
            Back to mock exam overview
          </Link>
        </div>
      )}
    </div>
  );
}
