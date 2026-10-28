import { ArrowLeft, ArrowRight, LogOut, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  countTimedExamAnswers,
  expireTimedExam,
  goToTimedExamQuestion,
  submitTimedExam,
  timedExamRemainingMs,
  toggleTimedExamAnswerChoice,
  toggleTimedExamFlag,
  type AssessmentContext,
  type TimedExamMutation,
  type TimedExamSession,
} from "../../../domain";
import { formatRemainingClock } from "../format";
import { useDeadlineClock, browserNow } from "../use-deadline-clock";
import { QuestionNavigator } from "./QuestionNavigator";
import { QuestionPanel } from "./QuestionPanel";
import { TimerBar } from "./TimerBar";

interface TimedExamSessionViewProps {
  session: TimedExamSession;
  context: AssessmentContext;
  storageWarning?: string;
  onSave: (session: TimedExamSession) => void;
  now?: () => number;
}

export function TimedExamSessionView({
  session,
  context,
  storageWarning,
  onSave,
  now = browserNow,
}: TimedExamSessionViewProps) {
  const deadlineAt = session.deadlineAt;
  const nowMs = useDeadlineClock(deadlineAt, true, now);
  const remainingMs = timedExamRemainingMs(session, nowMs);
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const [confirming, setConfirming] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const headingRef = useRef<HTMLLegendElement>(null);
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const wasConfirmingRef = useRef(false);
  const lastWarningBucketRef = useRef<number | null>(null);
  const expiryHandledRef = useRef(false);

  const currentIndex = session.session.currentQuestionIndex;
  const currentQuestionId = session.questionIds[currentIndex];
  const currentQuestion =
    currentQuestionId === undefined ? undefined : context.questionById.get(currentQuestionId);
  const selectedChoiceIds =
    currentQuestionId === undefined ? [] : (session.session.answers[currentQuestionId] ?? []);
  const flagged =
    currentQuestionId === undefined
      ? false
      : session.session.flaggedQuestionIds.includes(currentQuestionId);
  const counts = countTimedExamAnswers(session);

  useEffect(() => {
    headingRef.current?.focus();
  }, [session.id, currentIndex]);

  useEffect(() => {
    if (confirming) {
      confirmHeadingRef.current?.focus();
    } else if (wasConfirmingRef.current) {
      submitButtonRef.current?.focus();
    }

    wasConfirmingRef.current = confirming;
  }, [confirming]);

  useEffect(() => {
    if (remainingSeconds > 600) {
      lastWarningBucketRef.current = null;
      return;
    }

    const bucket = remainingSeconds > 300 ? 600 : remainingSeconds > 60 ? 300 : 60;

    if (lastWarningBucketRef.current !== null && lastWarningBucketRef.current <= bucket) {
      return;
    }

    lastWarningBucketRef.current = bucket;
    setAnnouncement(
      bucket === 60 ? "1 minute remaining." : `${bucket / 60} minutes remaining.`,
    );
  }, [remainingSeconds]);

  // The persisted deadline is authoritative. This effect also runs on mount, so
  // a reload after the deadline submits immediately instead of resuming.
  useEffect(() => {
    if (remainingMs > 0 || expiryHandledRef.current) {
      return;
    }

    expiryHandledRef.current = true;
    const outcome = expireTimedExam(context, session, now());

    if (outcome.autoSubmitted) {
      onSave(outcome.session);
    }
  }, [context, now, onSave, remainingMs, session]);

  const applyMutation = (next: TimedExamMutation) => {
    if (next.autoSubmitted) {
      setAnnouncement("Time is up. Your timed exam was submitted automatically.");
    }

    if (next.session !== session) {
      onSave(next.session);
    }
  };

  const goToIndex = (index: number) => {
    if (index === currentIndex) {
      return;
    }

    applyMutation(goToTimedExamQuestion(context, session, index, now()));
  };

  const handleChoice = (choiceId: string) => {
    if (currentQuestion === undefined) {
      return;
    }

    applyMutation(
      toggleTimedExamAnswerChoice(context, session, currentQuestion.id, choiceId, now()),
    );
  };

  const handleFlag = () => {
    if (currentQuestion === undefined) {
      return;
    }

    applyMutation(toggleTimedExamFlag(context, session, currentQuestion.id, now()));
  };

  const confirmSubmit = () => {
    const submission = submitTimedExam(context, session, new Date(now()).toISOString());

    if (submission.changed) {
      onSave(submission.session);
    }

    setConfirming(false);
  };

  if (currentQuestion === undefined) {
    return (
      <section className="assessment-start" aria-labelledby="timed-broken-title">
        <h2 className="assessment-start-title" id="timed-broken-title">
          This timed exam cannot be rendered
        </h2>
        <p className="assessment-start-copy">
          The saved attempt references a question that is not in the current content registry. No
          answer was scored. Discard the saved attempt from the recovery state on this page.
        </p>
      </section>
    );
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === session.questionIds.length - 1;
  const liveAnnouncement =
    remainingMs === 0
      ? "Time is up. Your timed exam is being submitted automatically."
      : announcement;

  return (
    <div className="assessment timed-session">
      <header className="assessment-header timed-header">
        <div>
          <span className="assessment-kicker">Timed simulation · in progress</span>
          <h2 className="assessment-title">CCAO-F timed mock exam</h2>
          <p className="assessment-subtitle">
            {counts.answered} of {session.questionIds.length} answered · {counts.unanswered}{" "}
            unanswered · {counts.flagged} flagged
          </p>
        </div>
        <Link className="button button--ghost button--sm" to="/mock-exam">
          <LogOut size={13} strokeWidth={2} aria-hidden="true" />
          Leave exam
        </Link>
      </header>

      <TimerBar
        remainingSeconds={remainingSeconds}
        deadlineAt={deadlineAt}
        expired={remainingMs === 0}
      />

      {storageWarning ? (
        <p className="study-alert" role="alert">
          {storageWarning}
        </p>
      ) : null}

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <div className="timed-layout">
        <div className="timed-main">
          <QuestionPanel
            question={currentQuestion}
            index={currentIndex}
            total={session.questionIds.length}
            selectedChoiceIds={selectedChoiceIds}
            flagged={flagged}
            mode="exam"
            onToggleChoice={handleChoice}
            onToggleFlag={handleFlag}
            headingRef={headingRef}
          />

          <nav className="assessment-pager" aria-label="Timed exam questions">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => goToIndex(currentIndex - 1)}
              disabled={isFirst}
            >
              <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => goToIndex(currentIndex + 1)}
              disabled={isLast}
            >
              Next
              <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          </nav>

          {confirming ? (
            <section
              className="assessment-confirm timed-confirm"
              aria-labelledby="timed-submit-title"
              aria-describedby="timed-submit-description"
            >
              <h3
                className="assessment-confirm-title"
                id="timed-submit-title"
                tabIndex={-1}
                ref={confirmHeadingRef}
              >
                Submit the timed exam?
              </h3>
              <p className="assessment-confirm-copy" id="timed-submit-description">
                {counts.unanswered === 0
                  ? "All questions are answered."
                  : `${counts.unanswered} question${counts.unanswered === 1 ? " is" : "s are"} unanswered and will be scored as incorrect.`}{" "}
                {counts.flagged} flagged question{counts.flagged === 1 ? " remains" : "s remain"} in
                the review navigator. You have {formatRemainingClock(remainingSeconds)} remaining.
                You cannot change answers after submission, and this will be recorded as a manual
                submission.
              </p>
              <div className="assessment-actions">
                <button type="button" className="button button--primary" onClick={confirmSubmit}>
                  Submit exam now
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
                <Send size={14} strokeWidth={2} aria-hidden="true" />
                Submit exam
              </button>
              <span className="assessment-hint">
                {counts.unanswered === 0
                  ? "Submitting ends this attempt and locks every answer."
                  : `${counts.unanswered} unanswered. Submitting marks them incorrect and locks every answer.`}
              </span>
            </div>
          )}
        </div>

        <div className="timed-aside">
          <QuestionNavigator
            session={session}
            currentIndex={currentIndex}
            mode="exam"
            onSelect={goToIndex}
          />
          <p className="timed-leave-note">
            Answer, flag, and navigation changes are saved locally after each action. Leaving this
            page does not stop the countdown; the same attempt resumes with the original deadline.
          </p>
        </div>
      </div>
    </div>
  );
}
