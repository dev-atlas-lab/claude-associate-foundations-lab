import { z } from "zod";
import { timedExamSessionSchema, type TimedExamSession } from "../domain";
import {
  classifyStorageError,
  describeError,
  type SaveFailureReason,
  type StorageLike,
} from "./storage";

/**
 * Independent, versioned storage for the timed simulation.
 *
 * The timed exam deliberately does not share `cfl.study.v1`: its lifecycle
 * (single in-progress or submitted attempt, persisted deadline, retained
 * result) is different from the Practice attempt history. Keeping it separate
 * means a timed-exam schema or fingerprint change cannot corrupt or invalidate
 * Practice attempts, and no migration of existing study data is required.
 */

export const TIMED_EXAM_STORAGE_KEY = "cfl.timed-exam.v1";
export const TIMED_EXAM_ENVELOPE_VERSION = 1;

export const timedExamEnvelopeSchema = z.object({
  schemaVersion: z.literal(TIMED_EXAM_ENVELOPE_VERSION),
  contentFingerprint: z.string().trim().min(1),
  savedAt: z.iso.datetime(),
  session: timedExamSessionSchema,
});

export type TimedExamEnvelope = z.infer<typeof timedExamEnvelopeSchema>;

export type LoadTimedExamResult =
  | { status: "empty" }
  | { status: "ready"; envelope: TimedExamEnvelope; raw: string }
  | { status: "corrupt"; reason: string; raw: string }
  | {
      status: "incompatible";
      reason: string;
      raw: string;
      storedVersion?: number;
      storedFingerprint?: string;
    }
  | { status: "unavailable"; reason: string };

export type SaveTimedExamResult =
  | { ok: true; savedAt: string }
  | { ok: false; reason: SaveFailureReason; message: string };

export function loadTimedExamFromStorage(
  storage: StorageLike | undefined,
  currentFingerprint: string,
): LoadTimedExamResult {
  if (!storage) {
    return {
      status: "unavailable",
      reason: "This browser did not expose localStorage.",
    };
  }

  let raw: string | null;

  try {
    raw = storage.getItem(TIMED_EXAM_STORAGE_KEY);
  } catch (error) {
    return {
      status: "unavailable",
      reason: `Reading the saved timed exam was blocked: ${describeError(error)}`,
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
      reason: "Saved timed-exam data is not valid JSON.",
      raw,
    };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {
      status: "corrupt",
      reason: "Saved timed-exam data is not an object.",
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
      reason: "Saved timed-exam data has no numeric schema version.",
      raw,
    };
  }

  if (candidate.schemaVersion !== TIMED_EXAM_ENVELOPE_VERSION) {
    return {
      status: "incompatible",
      reason: `Saved timed-exam data uses schema version ${candidate.schemaVersion}; this app expects ${TIMED_EXAM_ENVELOPE_VERSION}.`,
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
      reason: "Saved timed-exam data has no content fingerprint.",
      raw,
    };
  }

  if (candidate.contentFingerprint !== currentFingerprint) {
    return {
      status: "incompatible",
      reason:
        "This saved timed exam was created with different questions, answer keys, or exam settings. It will not be resumed or scored.",
      raw,
      storedVersion: candidate.schemaVersion,
      storedFingerprint: candidate.contentFingerprint,
    };
  }

  const envelope = timedExamEnvelopeSchema.safeParse(parsed);

  if (!envelope.success) {
    const firstIssue = envelope.error.issues[0];
    const path = firstIssue?.path.join(".") || "session";
    return {
      status: "corrupt",
      reason: `Saved timed-exam data is invalid at ${path}: ${firstIssue?.message ?? "unknown issue"}.`,
      raw,
    };
  }

  return { status: "ready", envelope: envelope.data, raw };
}

export function saveTimedExamToStorage(
  storage: StorageLike | undefined,
  currentFingerprint: string,
  session: TimedExamSession,
  savedAt: string,
): SaveTimedExamResult {
  if (!storage) {
    return {
      ok: false,
      reason: "unavailable",
      message:
        "Local storage is not available. The timed exam is running in memory only and will be lost on refresh.",
    };
  }

  const envelope = timedExamEnvelopeSchema.safeParse({
    schemaVersion: TIMED_EXAM_ENVELOPE_VERSION,
    contentFingerprint: currentFingerprint,
    savedAt,
    session,
  });

  if (!envelope.success) {
    return {
      ok: false,
      reason: "invalid-state",
      message: `The timed exam failed validation: ${envelope.error.issues[0]?.message ?? "unknown issue"}.`,
    };
  }

  try {
    storage.setItem(TIMED_EXAM_STORAGE_KEY, JSON.stringify(envelope.data));
    return { ok: true, savedAt };
  } catch (error) {
    const reason = classifyStorageError(error);

    return {
      ok: false,
      reason,
      message:
        reason === "quota"
          ? "Browser storage is full. This timed-exam change is kept in memory only."
          : reason === "security"
            ? "This browser blocked the timed-exam write. Changes are kept in memory only."
            : `Saving the timed exam failed: ${describeError(error)}`,
    };
  }
}

export function clearTimedExamFromStorage(
  storage: StorageLike | undefined,
): SaveTimedExamResult {
  if (!storage) {
    return {
      ok: false,
      reason: "unavailable",
      message: "Local storage is not available.",
    };
  }

  try {
    storage.removeItem(TIMED_EXAM_STORAGE_KEY);
    return { ok: true, savedAt: new Date().toISOString() };
  } catch (error) {
    return {
      ok: false,
      reason: classifyStorageError(error),
      message: `Clearing the timed exam failed: ${describeError(error)}`,
    };
  }
}
