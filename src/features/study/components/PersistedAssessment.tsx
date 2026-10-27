import { useState } from "react";
import type {
  AssessmentDefinition,
  AssessmentSession,
  AttemptOrigin,
  Question,
} from "../../../domain";
import { saveStudySession } from "../../../persistence/study-store";
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

  const handleStart = (): AssessmentSession | null => {
    const outcome = startPersistedAttempt(definition, questions, origin);

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
        onStart={handleStart}
        onSessionChange={saveStudySession}
        persisted
        allowNewAttempt={allowNewAttempt}
      />
    </>
  );
}
