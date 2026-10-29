import { z } from "zod";
import {
  emptyStudyState,
  studyStateSchema,
  type AssessmentDefinition,
  type Question,
  type ReviewResolution,
  type StudyAttempt,
  type StudyState,
} from "../domain";

/**
 * Versioned local-study envelope. The adapter is deliberately small and
 * framework-free so malformed data, a version change, a content change, blocked
 * storage, and quota failures can all be tested without a browser.
 */
export const STUDY_STORAGE_KEY = "cfl.study.v1";
export const STUDY_SCHEMA_VERSION = 1;

export const studyEnvelopeSchema = z.object({
  schemaVersion: z.literal(STUDY_SCHEMA_VERSION),
  contentFingerprint: z.string().trim().min(1),
  savedAt: z.iso.datetime(),
  state: studyStateSchema,
});

export type StudyEnvelope = z.infer<typeof studyEnvelopeSchema>;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type LoadStudyResult =
  | { status: "empty" }
  | { status: "ready"; envelope: StudyEnvelope }
  | { status: "corrupt"; reason: string; raw: string }
  | {
      status: "incompatible";
      reason: string;
      raw: string;
      storedVersion?: number;
      storedFingerprint?: string;
    }
  | { status: "unavailable"; reason: string };

export type SaveFailureReason =
  | "unavailable"
  | "quota"
  | "security"
  | "invalid-state"
  | "unknown";

export type SaveStudyResult =
  | { ok: true; savedAt: string }
  | { ok: false; reason: SaveFailureReason; message: string };

export function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || error.name;
  }

  return "unknown storage error";
}

export function classifyStorageError(error: unknown): SaveFailureReason {
  if (typeof error === "object" && error !== null) {
    const candidate = error as { name?: unknown; code?: unknown };

    if (candidate.name === "QuotaExceededError" || candidate.code === 22 || candidate.code === 1014) {
      return "quota";
    }

    if (candidate.name === "SecurityError" || candidate.code === 18) {
      return "security";
    }

    if (candidate.name === "InvalidStateError") {
      return "unavailable";
    }
  }

  return "unknown";
}

export function loadStudyStateFromStorage(
  storage: StorageLike | undefined,
  currentFingerprint: string,
): LoadStudyResult {
  if (!storage) {
    return {
      status: "unavailable",
      reason: "This browser did not expose localStorage.",
    };
  }

  let raw: string | null;

  try {
    raw = storage.getItem(STUDY_STORAGE_KEY);
  } catch (error) {
    return {
      status: "unavailable",
      reason: `Reading local data was blocked: ${describeError(error)}`,
    };
  }

  if (raw === null || raw.trim() === "") {
    return { status: "empty" };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      status: "corrupt",
      reason: "Saved study data is not valid JSON.",
      raw,
    };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {
      status: "corrupt",
      reason: "Saved study data is not an object.",
      raw,
    };
  }

  const candidate = parsed as {
    schemaVersion?: unknown;
    contentFingerprint?: unknown;
  };

  if (typeof candidate.schemaVersion !== "number") {
    return {
      status: "corrupt",
      reason: "Saved study data has no numeric schema version.",
      raw,
    };
  }

  if (candidate.schemaVersion !== STUDY_SCHEMA_VERSION) {
    return {
      status: "incompatible",
      reason: `Saved study data uses schema version ${candidate.schemaVersion}; this app expects ${STUDY_SCHEMA_VERSION}.`,
      raw,
      storedVersion: candidate.schemaVersion,
      storedFingerprint:
        typeof candidate.contentFingerprint === "string"
          ? candidate.contentFingerprint
          : undefined,
    };
  }

  if (typeof candidate.contentFingerprint !== "string") {
    return {
      status: "corrupt",
      reason: "Saved study data has no content fingerprint.",
      raw,
    };
  }

  if (candidate.contentFingerprint !== currentFingerprint) {
    return {
      status: "incompatible",
      reason:
        "Saved attempts were created with different questions or answer keys, so they cannot be resumed or scored safely.",
      raw,
      storedVersion: candidate.schemaVersion,
      storedFingerprint: candidate.contentFingerprint,
    };
  }

  const envelope = studyEnvelopeSchema.safeParse(parsed);

  if (!envelope.success) {
    const firstIssue = envelope.error.issues[0];
    const path = firstIssue?.path.join(".") || "state";
    return {
      status: "corrupt",
      reason: `Saved study data is invalid at ${path}: ${firstIssue?.message ?? "unknown issue"}.`,
      raw,
    };
  }

  return { status: "ready", envelope: envelope.data };
}

export function saveStudyStateToStorage(
  storage: StorageLike | undefined,
  currentFingerprint: string,
  state: StudyState,
  savedAt: string,
): SaveStudyResult {
  if (!storage) {
    return {
      ok: false,
      reason: "unavailable",
      message: "Local storage is not available, so this change was kept in memory only.",
    };
  }

  const envelope = studyEnvelopeSchema.safeParse({
    schemaVersion: STUDY_SCHEMA_VERSION,
    contentFingerprint: currentFingerprint,
    savedAt,
    state,
  });

  if (!envelope.success) {
    return {
      ok: false,
      reason: "invalid-state",
      message: `Study state failed validation: ${envelope.error.issues[0]?.message ?? "unknown issue"}.`,
    };
  }

  try {
    storage.setItem(STUDY_STORAGE_KEY, JSON.stringify(envelope.data));
    return { ok: true, savedAt };
  } catch (error) {
    const reason = classifyStorageError(error);

    return {
      ok: false,
      reason,
      message:
        reason === "quota"
          ? "This browser's local storage is full. Your latest change is kept in memory only."
          : reason === "security"
            ? "This browser blocked local storage writes. Your latest change is kept in memory only."
            : `Saving local data failed: ${describeError(error)}`,
    };
  }
}

export function clearStudyStateFromStorage(
  storage: StorageLike | undefined,
): SaveStudyResult {
  if (!storage) {
    return {
      ok: false,
      reason: "unavailable",
      message: "Local storage is not available.",
    };
  }

  try {
    storage.removeItem(STUDY_STORAGE_KEY);
    return { ok: true, savedAt: new Date().toISOString() };
  } catch (error) {
    return {
      ok: false,
      reason: classifyStorageError(error),
      message: `Clearing local data failed: ${describeError(error)}`,
    };
  }
}

/**
 * Resolve `window.localStorage` without letting a blocked or missing storage
 * object escape as an exception. Shared by the study and timed-exam stores.
 */
export function getBrowserStorage(): StorageLike | undefined {
  try {
    if (typeof window === "undefined") {
      return undefined;
    }

    return window.localStorage;
  } catch {
    return undefined;
  }
}

export interface StudyMigrationPlan {
  canMigrate: boolean;
  compatibleAttempts: StudyAttempt[];
  droppedAttempts: number;
  compatibleResolutions: ReviewResolution[];
  migratedState: StudyState;
}

const emptyMigrationPlan: StudyMigrationPlan = {
  canMigrate: false,
  compatibleAttempts: [],
  droppedAttempts: 0,
  compatibleResolutions: [],
  migratedState: emptyStudyState,
};

function isAttemptCompatibleWithRegistry(
  attempt: StudyAttempt,
  questionsById: ReadonlyMap<string, Question>,
  assessmentsById: ReadonlyMap<string, AssessmentDefinition>,
): boolean {
  if (attempt.questionIds.length === 0) {
    return false;
  }

  const questionIdSet = new Set(attempt.questionIds);

  for (const questionId of attempt.questionIds) {
    if (!questionsById.has(questionId)) {
      return false;
    }
  }

  for (const [answeredQuestionId, choiceIds] of Object.entries(attempt.session.answers)) {
    if (!questionIdSet.has(answeredQuestionId)) {
      return false;
    }

    const question = questionsById.get(answeredQuestionId);
    if (!question) {
      return false;
    }

    const validChoiceIds = new Set(question.choices.map((choice) => choice.id));
    for (const choiceId of choiceIds) {
      if (!validChoiceIds.has(choiceId)) {
        return false;
      }
    }
  }

  for (const flaggedId of attempt.session.flaggedQuestionIds) {
    if (!questionIdSet.has(flaggedId)) {
      return false;
    }
  }

  if (attempt.origin.kind === "practice" && !assessmentsById.has(attempt.origin.practiceSetId)) {
    return false;
  }

  if (attempt.session.status === "in-progress") {
    const currentDef = assessmentsById.get(attempt.session.assessmentId);
    if (!currentDef) {
      return false;
    }

    if (
      currentDef.questionIds.length !== attempt.questionIds.length ||
      !currentDef.questionIds.every((id) => questionIdSet.has(id))
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Inspect an incompatible v1 envelope whose contentFingerprint is stale and
 * extract the subset of attempts and review resolutions that remain valid
 * against the current question bank and assessment registry.
 */
export function inspectCompatibleStudyMigration(
  raw: string | undefined,
  storedVersion: number | undefined,
  storedFingerprint: string | undefined,
  currentFingerprint: string,
  questionsById: ReadonlyMap<string, Question>,
  assessmentsById: ReadonlyMap<string, AssessmentDefinition>,
): StudyMigrationPlan {
  if (
    !raw ||
    storedVersion !== STUDY_SCHEMA_VERSION ||
    !storedFingerprint ||
    storedFingerprint === currentFingerprint
  ) {
    return emptyMigrationPlan;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyMigrationPlan;
  }

  const envelope = studyEnvelopeSchema.safeParse(parsed);
  if (!envelope.success) {
    return emptyMigrationPlan;
  }

  const compatibleAttempts: StudyAttempt[] = [];
  let droppedAttempts = 0;

  for (const attempt of envelope.data.state.attempts) {
    if (isAttemptCompatibleWithRegistry(attempt, questionsById, assessmentsById)) {
      compatibleAttempts.push(attempt);
    } else {
      droppedAttempts += 1;
    }
  }

  if (compatibleAttempts.length === 0) {
    return {
      ...emptyMigrationPlan,
      droppedAttempts,
    };
  }

  const compatibleAttemptById = new Map(
    compatibleAttempts.map((attempt) => [attempt.session.id, new Set(attempt.questionIds)]),
  );

  const compatibleResolutions = envelope.data.state.reviewResolutions.filter((resolution) => {
    const questionSet = compatibleAttemptById.get(resolution.attemptId);
    return questionSet !== undefined && questionSet.has(resolution.questionId);
  });

  const migratedCandidate = studyStateSchema.safeParse({
    attempts: compatibleAttempts,
    reviewResolutions: compatibleResolutions,
  });

  if (!migratedCandidate.success) {
    return emptyMigrationPlan;
  }

  return {
    canMigrate: true,
    compatibleAttempts,
    droppedAttempts,
    compatibleResolutions,
    migratedState: migratedCandidate.data,
  };
}
