import { describe, expect, it } from "vitest";
import {
  createTimedExamSession,
  type AssessmentPolicy,
} from "../domain";
import {
  TIMED_EXAM_ENVELOPE_VERSION,
  TIMED_EXAM_STORAGE_KEY,
  clearTimedExamFromStorage,
  loadTimedExamFromStorage,
  saveTimedExamToStorage,
} from "../persistence/timed-exam-storage";
import type { StorageLike } from "../persistence/storage";

const fingerprint = "content::timed-exam-v1::60x120::mock-exam-timed";
const savedAt = "2026-10-28T09:00:00.000Z";
const policy: AssessmentPolicy = {
  scoring: "all-or-nothing",
  allowAnswerChangesBeforeSubmit: true,
};

function session(overrides: Partial<Parameters<typeof createTimedExamSession>[0]> = {}) {
  return createTimedExamSession({
    sessionId: "timed-storage-1",
    assessmentId: "mock-exam-timed",
    blueprintId: "blueprint-test",
    questionIds: ["question-one", "question-two"],
    policy,
    durationMinutes: 120,
    startedAt: savedAt,
    ...overrides,
  });
}

function createStorage(initial?: string): StorageLike & { values: Map<string, string> } {
  const values = new Map<string, string>();

  if (initial !== undefined) {
    values.set(TIMED_EXAM_STORAGE_KEY, initial);
  }

  return {
    values,
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

function envelope(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    schemaVersion: TIMED_EXAM_ENVELOPE_VERSION,
    contentFingerprint: fingerprint,
    savedAt,
    session: session(),
    ...overrides,
  });
}

describe("versioned timed-exam storage", () => {
  it("round-trips an independent timed-exam envelope", () => {
    const storage = createStorage();
    const current = session();

    expect(saveTimedExamToStorage(storage, fingerprint, current, savedAt)).toEqual({
      ok: true,
      savedAt,
    });

    const loaded = loadTimedExamFromStorage(storage, fingerprint);

    expect(loaded.status).toBe("ready");

    if (loaded.status === "ready") {
      expect(loaded.envelope.session).toEqual(current);
      expect(loaded.envelope.contentFingerprint).toBe(fingerprint);
      expect(loaded.raw).toContain("mock-exam-timed");
      expect(loaded.raw).toContain("contentFingerprint");
    }

    expect(storage.values.has("cfl.study.v1")).toBe(false);
  });

  it("reports empty and unavailable storage distinctly", () => {
    expect(loadTimedExamFromStorage(createStorage(), fingerprint)).toEqual({ status: "empty" });
    expect(loadTimedExamFromStorage(undefined, fingerprint)).toEqual({
      status: "unavailable",
      reason: "This browser did not expose localStorage.",
    });
  });

  it("preserves raw corrupt JSON and malformed payloads", () => {
    const raw = "{not json";
    const loaded = loadTimedExamFromStorage(createStorage(raw), fingerprint);

    expect(loaded.status).toBe("corrupt");

    if (loaded.status === "corrupt") {
      expect(loaded.raw).toBe(raw);
      expect(loaded.reason).toMatch(/not valid JSON/i);
    }

    expect(loadTimedExamFromStorage(createStorage("[]"), fingerprint).status).toBe("corrupt");
    expect(
      loadTimedExamFromStorage(createStorage(JSON.stringify({ session: session() })), fingerprint)
        .status,
    ).toBe("corrupt");
    expect(
      loadTimedExamFromStorage(
        createStorage(envelope({ session: { ...session(), schemaVersion: 99 } })),
        fingerprint,
      ).status,
    ).toBe("corrupt");
  });

  it("blocks unsupported versions without deleting the payload", () => {
    const raw = envelope({ schemaVersion: 2 });
    const loaded = loadTimedExamFromStorage(createStorage(raw), fingerprint);

    expect(loaded.status).toBe("incompatible");

    if (loaded.status === "incompatible") {
      expect(loaded.storedVersion).toBe(2);
      expect(loaded.storedFingerprint).toBe(fingerprint);
      expect(loaded.raw).toBe(raw);
      expect(loaded.reason).toMatch(/schema version 2/i);
    }
  });

  it("blocks a different content fingerprint without deleting the payload", () => {
    const loaded = loadTimedExamFromStorage(
      createStorage(envelope({ contentFingerprint: "old::timed" })),
      fingerprint,
    );

    expect(loaded.status).toBe("incompatible");

    if (loaded.status === "incompatible") {
      expect(loaded.storedFingerprint).toBe("old::timed");
      expect(loaded.reason).toMatch(/different questions, answer keys, or exam settings/i);
    }
  });

  it("keeps a quota or security write failure explicit", () => {
    const quotaStorage = createStorage();
    quotaStorage.setItem = () => {
      const error = new Error("quota");
      error.name = "QuotaExceededError";
      throw error;
    };

    const quota = saveTimedExamToStorage(quotaStorage, fingerprint, session(), savedAt);

    expect(quota.ok).toBe(false);

    if (!quota.ok) {
      expect(quota.reason).toBe("quota");
      expect(quota.message).toMatch(/full/i);
    }

    const securityStorage = createStorage();
    securityStorage.setItem = () => {
      const error = new Error("blocked");
      error.name = "SecurityError";
      throw error;
    };

    const security = saveTimedExamToStorage(securityStorage, fingerprint, session(), savedAt);

    expect(security.ok).toBe(false);

    if (!security.ok) {
      expect(security.reason).toBe("security");
    }
  });

  it("clears only the timed-exam key", () => {
    const storage = createStorage(envelope());
    storage.values.set("cfl.study.v1", "keep-me");

    expect(clearTimedExamFromStorage(storage).ok).toBe(true);
    expect(storage.values.has(TIMED_EXAM_STORAGE_KEY)).toBe(false);
    expect(storage.values.get("cfl.study.v1")).toBe("keep-me");
    expect(clearTimedExamFromStorage(undefined)).toMatchObject({
      ok: false,
      reason: "unavailable",
    });
  });
});
