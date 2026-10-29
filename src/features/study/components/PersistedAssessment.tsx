import { useState } from "react";
import {
  findStudyAttempt,
  type AssessmentDefinition,
  type AssessmentSession,
  type AttemptOrigin,
  type Question,
} from "../../../domain";
import { getStudySnapshot, saveStudySession } from "../../../persistence/study-store";
import { AssessmentRunner } from "../../assessment/components/AssessmentRunner";
import { startPersistedAttempt } from "../start-attempt";

interface PersistedAssessmentProps {
  definition: AssessmentDefinition;
  questions: readonly Question[];
  origin: AttemptOrigin;
  /** Resume this attempt instead of showing the start screen. */
  initialSession?: AssessmentSession;
  allowNewAttempt?: boolean;
}

/**
 * Wires the reusable runner to local persistence. The runner owns the session
 * transitions; this wrapper only creates the first snapshot and saves changes.
 */
export function PersistedAssessment({
  definition,
  questions,
  origin,
  initialSession,
  allowNewAttempt = true,
}: PersistedAssessmentProps) {
  const [startError, setStartError] = useState<string>();
  const initialAttempt = initialSession
    ? findStudyAttempt(getStudySnapshot().state, initialSession.id)
    : undefined;

  const handleStart = (
    attemptDefinition: AssessmentDefinition = definition,
    sessionId?: string,
  ): AssessmentSession | null => {
    const outcome = startPersistedAttempt(
      attemptDefinition,
      questions,
      origin,
      sessionId,
    );

    if (!outcome.ok) {
      setStartError(outcome.message);
      return null;
    }

    setStartError(undefined);
    return outcome.session;
  };

  return (
    <>
      {startError ? (
        <p className="study-alert" role="alert">
          {startError}
        </p>
      ) : null}
      <AssessmentRunner
        definition={definition}
        questions={questions}
        initialSession={initialSession}
        initialQuestionIds={initialAttempt?.questionIds}
        onStart={handleStart}
        onSessionChange={saveStudySession}
        persisted
        allowNewAttempt={allowNewAttempt}
      />
    </>
  );
}
