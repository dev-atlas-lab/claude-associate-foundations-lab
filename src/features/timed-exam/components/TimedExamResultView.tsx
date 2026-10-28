import { ArrowLeft, ArrowRight, Clock, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  countTimedExamAnswers,
  getTimedExamResult,
  type AssessmentContext,
  type TimedExamSession,
} from "../../../domain";
import { getQuestionBankEntry, getSources } from "../../../content";
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

export function TimedExamResultView({
  session,
  context,
  onDiscard,
}: TimedExamResultViewProps) {
  const result = getTimedExamResult(session);
  const counts = countTimedExamAnswers(session);
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
              Kết quả bài thi thử
            </h2>
            <p className="timed-submission" data-reason={submissionReason}>
              {submissionReason === "time-expired" ? (
                <>
                  <Clock size={13} strokeWidth={2} aria-hidden="true" />
                  <span className="badge badge--warn">Automatic expiry</span>
                  Hết giờ — bài được nộp tự động tại hạn chót.
                </>
              ) : (
                <>
                  <span className="badge badge--ok">Manual submission</span>
                  Bạn đã nộp bài thủ công trước khi hết giờ.
                </>
              )}
              <span className="timed-submission-time">
                Nộp lúc <time dateTime={result.submittedAt}>{formatLocalTimestamp(result.submittedAt)}</time>
              </span>
            </p>
          </div>
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
            <dt className="stat-label">Đã đánh dấu</dt>
            <dd className="stat-value">{counts.flagged}</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Raw percentage</dt>
            <dd className="stat-value">{result.rawPercentage}%</dd>
          </div>
        </dl>

        <p className="assessment-disclaimer">
          Đây là kết quả thô (raw performance) của bài luyện tập có giờ, không phải điểm scaled chính
          thức trên thang 100–1.000 và không phải dự đoán đậu/rớt. Mỗi câu được chấm theo exact set
          với chế độ all-or-nothing; câu chưa trả lời được tính là sai và được báo riêng. Không có
          partial credit.
        </p>
      </section>

      <section className="section timed-review" aria-labelledby="timed-review-title">
        <div className="section-heading-row">
          <h3 className="section-title" id="timed-review-title">
            Xem lại từng câu
          </h3>
          <span className="section-note">
            Đáp án đã chọn, đáp án đúng, giải thích và nguồn tham chiếu
          </span>
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
            />

            <nav className="assessment-pager" aria-label="Timed exam review questions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setIndex((current) => Math.max(0, current - 1))}
                disabled={index === 0}
              >
                <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
                Previous
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={() =>
                  setIndex((current) =>
                    Math.min(session.questionIds.length - 1, current + 1),
                  )
                }
                disabled={index === session.questionIds.length - 1}
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
