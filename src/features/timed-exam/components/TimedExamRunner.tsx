import { useMemo, useState } from "react";
import {
  createTimedExamContext,
  createTimedExamSession,
  type AssessmentContext,
  type TimedExamSession,
} from "../../../domain";
import {
  primaryBlueprint,
} from "../../../content";
import {
  resolveTimedExamQuestions,
  selectTimedExamQuestionIds,
  timedExamAssessmentId,
  timedExamBlueprintId,
  timedExamDurationMinutes,
  timedExamEligibility,
  timedExamPolicy,
  timedExamRequestedItemCount,
} from "../../../content/timed-exam";
import { createId } from "../../../lib/ids";
import { browserNow } from "../use-deadline-clock";
import { TimedExamIntro } from "./TimedExamIntro";
import { TimedExamResultView } from "./TimedExamResultView";
import { TimedExamSessionView } from "./TimedExamSessionView";

interface StartResult {
  ok: boolean;
  message?: string;
}

interface TimedExamRunnerProps {
  session?: TimedExamSession;
  storageWarning?: string;
  onStart: (session: TimedExamSession) => StartResult;
  onSave: (session: TimedExamSession) => void;
  onDiscard: () => { ok: boolean; message?: string };
  now?: () => number;
}

export function TimedExamRunner({
  session,
  storageWarning,
  onStart,
  onSave,
  onDiscard,
  now = browserNow,
}: TimedExamRunnerProps) {
  const [startError, setStartError] = useState<string>();

  const resolved = useMemo(
    () => (session ? resolveTimedExamQuestions(session.questionIds) : undefined),
    [session],
  );

  const context: AssessmentContext | undefined = useMemo(() => {
    if (!session || !resolved || resolved.missingQuestionIds.length > 0) {
      return undefined;
    }

    return createTimedExamContext(session, resolved.questions);
  }, [resolved, session]);

  const handleStart = () => {
    setStartError(undefined);

    const sessionId = createId("timed-exam");
    const questionIds = selectTimedExamQuestionIds(sessionId);

    if (questionIds.length !== timedExamRequestedItemCount) {
      setStartError(
        `The reviewed bank can only fill ${questionIds.length} of ${timedExamRequestedItemCount} questions. The exam was not started and no filler item was created.`,
      );
      return;
    }

    const nextSession = createTimedExamSession({
      sessionId,
      assessmentId: timedExamAssessmentId,
      blueprintId: timedExamBlueprintId,
      questionIds,
      policy: timedExamPolicy,
      durationMinutes: timedExamDurationMinutes,
      startedAt: new Date(now()).toISOString(),
    });
    const outcome = onStart(nextSession);

    if (!outcome.ok) {
      setStartError(outcome.message ?? "The timed exam could not be started.");
    }
  };

  if (!session) {
    return (
      <TimedExamIntro
        requestedItemCount={timedExamEligibility.requestedItemCount}
        durationMinutes={timedExamEligibility.durationMinutes}
        availableItemCount={timedExamEligibility.availableItemCount}
        selectedItemCount={timedExamEligibility.selectedItemCount}
        shortfall={timedExamEligibility.shortfall}
        allocations={timedExamEligibility.allocations}
        domains={primaryBlueprint.domains.map((domain) => ({
          id: domain.id,
          code: domain.code,
          title: domain.title,
        }))}
        canStart={
          timedExamEligibility.shortfall === 0 &&
          timedExamEligibility.availableItemCount >= timedExamEligibility.requestedItemCount
        }
        storageWarning={storageWarning}
        startError={startError}
        onStart={handleStart}
      />
    );
  }

  if (!context || resolved?.missingQuestionIds.length) {
    return (
      <section className="timed-recovery" aria-labelledby="timed-content-mismatch-title">
        <div className="timed-recovery-body">
          <h2 className="timed-recovery-title" id="timed-content-mismatch-title">
            This timed exam does not match the current question bank
          </h2>
          <p className="timed-recovery-text">
            {resolved?.missingQuestionIds.length
              ? `${resolved.missingQuestionIds.length} saved question${
                  resolved.missingQuestionIds.length === 1 ? " is" : "s are"
                } no longer available.`
              : "The saved attempt could not be validated against the current question bank."}{" "}
            It was not resumed, answered, or scored. Discard the saved attempt to start a new one
            against the current content.
          </p>
          <div className="storage-notice-actions">
            <button type="button" className="button button--secondary button--sm" onClick={onDiscard}>
              Discard saved timed exam
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (session.session.status === "submitted") {
    return (
      <TimedExamResultView
        session={session}
        context={context}
        onDiscard={onDiscard}
      />
    );
  }

  return (
    <TimedExamSessionView
      session={session}
      context={context}
      storageWarning={storageWarning}
      onSave={onSave}
      now={now}
    />
  );
}
