import { useSyncExternalStore } from "react";
import { validateTimedExamContent, type TimedExamSession } from "../domain";
import {
  timedExamContentFingerprint,
  timedExamQuestionById,
} from "../content/timed-exam";
import {
  clearTimedExamFromStorage,
  loadTimedExamFromStorage,
  saveTimedExamToStorage,
} from "./timed-exam-storage";
import { getBrowserStorage } from "./storage";

/**
 * Single-slot timed-exam store. Exactly one attempt (in progress or submitted)
 * is relevant at a time, unlike the Practice history. The store never creates a
 * session on its own: starting, discarding, and resuming all require an
 * explicit caller action.
 */

export type TimedExamStoreStatus =
  | "empty"
  | "ready"
  | "corrupt"
  | "incompatible"
  | "unavailable";

export interface TimedExamSnapshot {
  status: TimedExamStoreStatus;
  session?: TimedExamSession;
  savedAt?: string;
  rawBackup?: string;
  message?: string;
  writeError?: string;
  storageAvailable: boolean;
  storedVersion?: number;
  storedFingerprint?: string;
}

export type TimedExamStoreErrorCode =
  | "local-data-blocked"
  | "session-already-active"
  | "session-not-found"
  | "submitted-session-immutable";

export class TimedExamStoreError extends Error {
  readonly code: TimedExamStoreErrorCode;

  constructor(code: TimedExamStoreErrorCode, message: string) {
    super(message);
    this.name = "TimedExamStoreError";
    this.code = code;
  }
}

function loadSnapshot(): TimedExamSnapshot {
  const storage = getBrowserStorage();
  const result = loadTimedExamFromStorage(storage, timedExamContentFingerprint);

  switch (result.status) {
    case "ready": {
      const issues = validateTimedExamContent(
        result.envelope.session,
        timedExamQuestionById,
      );

      if (issues.length > 0) {
        return {
          status: "incompatible",
          message: `Saved timed exam cannot be resumed: ${issues[0]?.message ?? "its content no longer matches"}`,
          rawBackup: result.raw,
          storageAvailable: true,
          storedVersion: result.envelope.schemaVersion,
          storedFingerprint: result.envelope.contentFingerprint,
        };
      }

      return {
        status: "ready",
        session: result.envelope.session,
        savedAt: result.envelope.savedAt,
        storageAvailable: true,
      };
    }
    case "empty":
      return { status: "empty", storageAvailable: true };
    case "unavailable":
      return {
        status: "unavailable",
        message: result.reason,
        storageAvailable: false,
      };
    case "corrupt":
      return {
        status: "corrupt",
        message: result.reason,
        rawBackup: result.raw,
        storageAvailable: true,
      };
    case "incompatible":
      return {
        status: "incompatible",
        message: result.reason,
        rawBackup: result.raw,
        storageAvailable: true,
        storedVersion: result.storedVersion,
        storedFingerprint: result.storedFingerprint,
      };
  }
}

let snapshot: TimedExamSnapshot = loadSnapshot();
const listeners = new Set<() => void>();

function emit(next: TimedExamSnapshot): void {
  snapshot = next;

  for (const listener of listeners) {
    listener();
  }
}

function isWriteBlocked(status: TimedExamStoreStatus): boolean {
  return status === "corrupt" || status === "incompatible";
}

function persist(session: TimedExamSession): TimedExamSnapshot {
  const savedAt = new Date().toISOString();
  const storage = getBrowserStorage();
  const result = saveTimedExamToStorage(
    storage,
    timedExamContentFingerprint,
    session,
    savedAt,
  );

  if (result.ok) {
    return {
      status: "ready",
      session,
      savedAt: result.savedAt,
      storageAvailable: true,
    };
  }

  if (result.reason === "unavailable" || result.reason === "security") {
    return {
      status: "unavailable",
      session,
      writeError: result.message,
      storageAvailable: false,
    };
  }

  return {
    status: snapshot.status === "empty" ? "ready" : snapshot.status,
    session,
    writeError: result.message,
    storageAvailable: snapshot.storageAvailable,
  };
}

export function subscribeToTimedExamStore(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getTimedExamSnapshot(): TimedExamSnapshot {
  return snapshot;
}

export function useTimedExamState(): TimedExamSnapshot {
  return useSyncExternalStore(
    subscribeToTimedExamStore,
    getTimedExamSnapshot,
    getTimedExamSnapshot,
  );
}

/**
 * Persist the first snapshot of a new attempt. A saved in-progress or submitted
 * attempt must be resumed or explicitly discarded first; this call never
 * overwrites one silently.
 */
export function startTimedExam(session: TimedExamSession): TimedExamSession {
  if (isWriteBlocked(snapshot.status)) {
    throw new TimedExamStoreError(
      "local-data-blocked",
      "Saved timed-exam data must be backed up or discarded before a new attempt can start.",
    );
  }

  if (snapshot.session !== undefined) {
    throw new TimedExamStoreError(
      "session-already-active",
      "A timed exam is already saved in this browser. Resume it or discard it explicitly.",
    );
  }

  emit(persist(session));
  return session;
}

/**
 * Persist an in-progress change or the one-time submission. Submitted data is
 * immutable: later review navigation is view-only and never reaches this store.
 */
export function saveTimedExamSession(session: TimedExamSession): void {
  if (isWriteBlocked(snapshot.status)) {
    emit({
      ...snapshot,
      writeError:
        "Saved timed-exam data needs recovery before another change can be written.",
    });
    return;
  }

  const current = snapshot.session;

  if (!current) {
    emit({
      ...snapshot,
      writeError: "No timed exam is active, so this change was not saved.",
    });
    return;
  }

  if (current.id !== session.id) {
    emit({
      ...snapshot,
      writeError: "A different timed exam is saved; this change was not applied.",
    });
    return;
  }

  if (current.session.status === "submitted") {
    if (JSON.stringify(current) === JSON.stringify(session)) {
      return;
    }

    emit({
      ...snapshot,
      writeError: "The submitted timed exam is immutable and was not changed.",
    });
    return;
  }

  if (JSON.stringify(current) === JSON.stringify(session)) {
    return;
  }

  emit(persist(session));
}

export type DiscardTimedExamResult =
  | { ok: true }
  | { ok: false; message: string };

/** Explicit recovery action. Clears only the timed-exam key, never `cfl.study.v1`. */
export function discardTimedExam(): DiscardTimedExamResult {
  const storage = getBrowserStorage();
  const result = clearTimedExamFromStorage(storage);

  if (!result.ok && result.reason !== "unavailable") {
    emit({ ...snapshot, writeError: result.message });
    return { ok: false, message: result.message };
  }

  emit({
    status: result.ok ? "empty" : "unavailable",
    storageAvailable: result.ok,
    message: result.ok ? undefined : result.message,
  });

  return result.ok ? { ok: true } : { ok: false, message: result.message };
}

/** Re-read storage; used by tests and after an external change. */
export function reloadTimedExamStore(): void {
  emit(loadSnapshot());
}

/** Test helper: reset the module-level snapshot after localStorage is cleared. */
export function resetTimedExamStoreForTests(): void {
  snapshot = loadSnapshot();
}
