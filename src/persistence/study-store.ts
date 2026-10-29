import { useSyncExternalStore } from "react";
import { allQuestions, assessments } from "../content";
import { contentFingerprint } from "../content/fingerprint";
import { mockExamDefinition, mockExamSet2Definition } from "../content/mock-exam";
import {
  StudyStateError,
  createStudyAttempt,
  emptyStudyState,
  findActiveAttempt,
  findStudyAttempt,
  resolveReviewItem,
  studyAttemptSchema,
  upsertStudyAttempt,
  type AssessmentDefinition,
  type AssessmentSession,
  type AttemptOrigin,
  type StudyAttempt,
  type StudyState,
} from "../domain";
import {
  clearStudyStateFromStorage,
  getBrowserStorage,
  inspectCompatibleStudyMigration,
  loadStudyStateFromStorage,
  saveStudyStateToStorage,
  type StudyMigrationPlan,
} from "./storage";

const questionsById = new Map(allQuestions.map((question) => [question.id, question]));
const assessmentsById = new Map(
  [...assessments, mockExamDefinition, mockExamSet2Definition].map((assessment) => [assessment.id, assessment]),
);

export type StudyStoreStatus =
  | "ready"
  | "empty"
  | "corrupt"
  | "incompatible"
  | "unavailable";

export interface StudySnapshot {
  status: StudyStoreStatus;
  state: StudyState;
  savedAt?: string;
  rawBackup?: string;
  message?: string;
  writeError?: string;
  storageAvailable: boolean;
  storedVersion?: number;
  storedFingerprint?: string;
  migrationPlan?: StudyMigrationPlan;
}

export type StudyStoreErrorCode = "local-data-blocked" | "attempt-already-active";

export class StudyStoreError extends Error {
  readonly code: StudyStoreErrorCode;

  constructor(code: StudyStoreErrorCode, message: string) {
    super(message);
    this.name = "StudyStoreError";
    this.code = code;
  }
}

function loadSnapshot(): StudySnapshot {
  const storage = getBrowserStorage();
  const result = loadStudyStateFromStorage(storage, contentFingerprint);

  switch (result.status) {
    case "ready":
      return {
        status: "ready",
        state: result.envelope.state,
        savedAt: result.envelope.savedAt,
        storageAvailable: true,
      };
    case "empty":
      return {
        status: "empty",
        state: emptyStudyState,
        storageAvailable: true,
      };
    case "unavailable":
      return {
        status: "unavailable",
        state: emptyStudyState,
        message: result.reason,
        storageAvailable: false,
      };
    case "corrupt":
      return {
        status: "corrupt",
        state: emptyStudyState,
        message: result.reason,
        rawBackup: result.raw,
        storageAvailable: true,
      };
    case "incompatible": {
      const migrationPlan = inspectCompatibleStudyMigration(
        result.raw,
        result.storedVersion,
        result.storedFingerprint,
        contentFingerprint,
        questionsById,
        assessmentsById,
      );
      return {
        status: "incompatible",
        state: emptyStudyState,
        message: result.reason,
        rawBackup: result.raw,
        storageAvailable: true,
        storedVersion: result.storedVersion,
        storedFingerprint: result.storedFingerprint,
        migrationPlan,
      };
    }
  }
}

let snapshot: StudySnapshot = loadSnapshot();
const listeners = new Set<() => void>();

function emit(next: StudySnapshot): void {
  snapshot = next;

  for (const listener of listeners) {
    listener();
  }
}

function isWriteBlocked(status: StudyStoreStatus): boolean {
  return status === "corrupt" || status === "incompatible";
}

function assertWritable(): void {
  if (isWriteBlocked(snapshot.status)) {
    throw new StudyStoreError(
      "local-data-blocked",
      "Saved study data must be backed up or reset before new attempts can be saved.",
    );
  }
}

function persist(nextState: StudyState): StudySnapshot {
  const savedAt = new Date().toISOString();
  const storage = getBrowserStorage();
  const result = saveStudyStateToStorage(
    storage,
    contentFingerprint,
    nextState,
    savedAt,
  );

  if (result.ok) {
    return {
      status: "ready",
      state: nextState,
      savedAt: result.savedAt,
      storageAvailable: true,
    };
  }

  if (result.reason === "unavailable" || result.reason === "security") {
    return {
      ...snapshot,
      status: "unavailable",
      state: nextState,
      writeError: result.message,
      storageAvailable: false,
    };
  }

  return {
    ...snapshot,
    status: snapshot.status === "empty" ? "ready" : snapshot.status,
    state: nextState,
    writeError: result.message,
    storageAvailable: true,
  };
}

export function subscribeToStudyStore(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getStudySnapshot(): StudySnapshot {
  return snapshot;
}

export function useStudyState(): StudySnapshot {
  return useSyncExternalStore(subscribeToStudyStore, getStudySnapshot, getStudySnapshot);
}

/**
 * Start and persist a new attempt. The caller creates the session so ids and
 * timestamps remain injectable and testable.
 */
export function startStudyAttempt(
  definition: AssessmentDefinition,
  session: AssessmentSession,
  origin: AttemptOrigin,
): StudyAttempt {
  assertWritable();

  const active = findActiveAttempt(snapshot.state, session.assessmentId);

  if (active) {
    throw new StudyStoreError(
      "attempt-already-active",
      `An in-progress attempt for "${session.assessmentId}" already exists. Resume it instead of starting a duplicate.`,
    );
  }

  const attempt = createStudyAttempt(definition, session, origin);
  emit(persist(upsertStudyAttempt(snapshot.state, attempt)));
  return attempt;
}

/**
 * Persist an in-progress session. Submitted attempts are immutable: a repeated
 * identical submission is a no-op, and later review navigation is ignored
 * rather than rewriting the submitted answers or timestamp.
 */
export function saveStudySession(session: AssessmentSession): void {
  if (isWriteBlocked(snapshot.status)) {
    return;
  }

  const existing = findStudyAttempt(snapshot.state, session.id);

  if (!existing) {
    return;
  }

  if (existing.session.status === "submitted") {
    return;
  }

  const candidate = studyAttemptSchema.safeParse({
    ...existing,
    session,
  });

  if (!candidate.success) {
    emit({
      ...snapshot,
      writeError: `The attempt could not be saved: ${candidate.error.issues[0]?.message ?? "invalid session"}.`,
    });
    return;
  }

  try {
    emit(persist(upsertStudyAttempt(snapshot.state, candidate.data)));
  } catch (error) {
    if (error instanceof StudyStateError) {
      emit({ ...snapshot, writeError: error.message });
      return;
    }

    throw error;
  }
}

export function resolveStudyReviewItem(attemptId: string, questionId: string): void {
  assertWritable();
  const nextState = resolveReviewItem(
    snapshot.state,
    attemptId,
    questionId,
    new Date().toISOString(),
  );

  if (nextState === snapshot.state) {
    return;
  }

  emit(persist(nextState));
}

export function resetStudyData(): void {
  const storage = getBrowserStorage();
  const result = clearStudyStateFromStorage(storage);

  if (!result.ok && result.reason !== "unavailable") {
    emit({ ...snapshot, writeError: result.message });
    return;
  }

  emit({
    status: result.ok ? "empty" : "unavailable",
    state: emptyStudyState,
    storageAvailable: result.ok,
    message: result.ok ? undefined : result.message,
  });
}

export function migrateCompatibleStudyData(): boolean {
  if (snapshot.status !== "incompatible" || !snapshot.migrationPlan?.canMigrate) {
    return false;
  }

  emit(persist(snapshot.migrationPlan.migratedState));
  return true;
}

/** Re-read storage. Used by Settings and by tests after external changes. */
export function reloadStudyStore(): void {
  emit(loadSnapshot());
}

/**
 * Test helper: reset the module-level snapshot after localStorage is cleared.
 * Production code never needs this because the store is the single writer.
 */
export function resetStudyStoreForTests(): void {
  snapshot = loadSnapshot();
}
