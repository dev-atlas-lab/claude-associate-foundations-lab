import {
  createAssessmentContext,
  startAssessment,
  type AssessmentDefinition,
  type AssessmentSession,
  type AttemptOrigin,
  type Question,
} from "../../domain";
import { createId } from "../../lib/ids";
import { StudyStoreError, startStudyAttempt } from "../../persistence/study-store";

export type StartAttemptOutcome =
  | { ok: true; session: AssessmentSession }
  | { ok: false; message: string };

function describeStartError(error: unknown): string {
  if (error instanceof StudyStoreError) {
    return error.message;
  }

  if (error instanceof Error) {
    return `The attempt could not be started: ${error.message}`;
  }

  return "The attempt could not be started because of an unknown error.";
}

/**
 * Build a fresh session, then hand it to the store so the attempt snapshot is
 * written before the learner answers anything. Callers resume an existing
 * in-progress attempt instead of calling this again.
 */
export function startPersistedAttempt(
  definition: AssessmentDefinition,
  questions: readonly Question[],
  origin: AttemptOrigin,
): StartAttemptOutcome {
  try {
    const context = createAssessmentContext(definition, questions);
    const session = startAssessment(context, {
      sessionId: createId(),
      startedAt: new Date().toISOString(),
    });
    const attempt = startStudyAttempt(definition, session, origin);

    return { ok: true, session: attempt.session };
  } catch (error) {
    return { ok: false, message: describeStartError(error) };
  }
}
