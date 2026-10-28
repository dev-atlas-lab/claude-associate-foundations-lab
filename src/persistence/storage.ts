import { z } from "zod";
import { studyStateSchema, type StudyState } from "../domain";

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
