import { describe, expect, it } from "vitest";
import { emptyStudyState } from "../domain";
import {
  STUDY_SCHEMA_VERSION,
  STUDY_STORAGE_KEY,
  clearStudyStateFromStorage,
  loadStudyStateFromStorage,
  saveStudyStateToStorage,
  type StorageLike,
} from "../persistence/storage";

const fingerprint = "study-v1-test-fingerprint";
const savedAt = "2026-10-26T10:00:00.000Z";

function createStorage(initial?: string): StorageLike & { values: Map<string, string> } {
  const values = new Map<string, string>();

  if (initial !== undefined) {
    values.set(STUDY_STORAGE_KEY, initial);
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
    schemaVersion: STUDY_SCHEMA_VERSION,
    contentFingerprint: fingerprint,
    savedAt,
    state: emptyStudyState,
    ...overrides,
  });
}

describe("versioned study storage", () => {
  it("round-trips a valid envelope", () => {
    const storage = createStorage();
    const saved = saveStudyStateToStorage(storage, fingerprint, emptyStudyState, savedAt);

    expect(saved).toEqual({ ok: true, savedAt });

    const loaded = loadStudyStateFromStorage(storage, fingerprint);

    expect(loaded.status).toBe("ready");

    if (loaded.status === "ready") {
      expect(loaded.envelope.state).toEqual(emptyStudyState);
      expect(loaded.envelope.contentFingerprint).toBe(fingerprint);
    }
  });

  it("reports empty storage and unavailable storage distinctly", () => {
    expect(loadStudyStateFromStorage(createStorage(), fingerprint)).toEqual({ status: "empty" });

    const unavailable = loadStudyStateFromStorage(undefined, fingerprint);

    expect(unavailable.status).toBe("unavailable");
  });

  it("preserves raw corrupt JSON and refuses to score it", () => {
    const raw = "{not json";
    const loaded = loadStudyStateFromStorage(createStorage(raw), fingerprint);

    expect(loaded.status).toBe("corrupt");

    if (loaded.status === "corrupt") {
      expect(loaded.raw).toBe(raw);
      expect(loaded.reason).toMatch(/not valid JSON/i);
    }
  });

  it("treats a missing or malformed envelope as corrupt", () => {
    expect(loadStudyStateFromStorage(createStorage("[]"), fingerprint).status).toBe("corrupt");
    expect(
      loadStudyStateFromStorage(createStorage(JSON.stringify({ state: emptyStudyState })), fingerprint)
        .status,
    ).toBe("corrupt");
    expect(
      loadStudyStateFromStorage(
        createStorage(envelope({ state: { attempts: "no", reviewResolutions: [] } })),
        fingerprint,
      ).status,
    ).toBe("corrupt");
  });

  it("blocks a different schema version", () => {
    const loaded = loadStudyStateFromStorage(
      createStorage(envelope({ schemaVersion: 2 })),
      fingerprint,
    );

    expect(loaded.status).toBe("incompatible");

    if (loaded.status === "incompatible") {
      expect(loaded.storedVersion).toBe(2);
      expect(loaded.reason).toMatch(/schema version 2/i);
    }
  });

  it("blocks a different content fingerprint", () => {
    const loaded = loadStudyStateFromStorage(
      createStorage(envelope({ contentFingerprint: "study-v1-old" })),
      fingerprint,
    );

    expect(loaded.status).toBe("incompatible");

    if (loaded.status === "incompatible") {
      expect(loaded.storedFingerprint).toBe("study-v1-old");
      expect(loaded.reason).toMatch(/different questions or answer keys/i);
    }
  });

  it("classifies quota and security write failures without dropping the change", () => {
    const quotaStorage = createStorage();
    quotaStorage.setItem = () => {
      const error = new Error("quota");
      error.name = "QuotaExceededError";
      throw error;
    };

    const quota = saveStudyStateToStorage(quotaStorage, fingerprint, emptyStudyState, savedAt);

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

    const security = saveStudyStateToStorage(
      securityStorage,
      fingerprint,
      emptyStudyState,
      savedAt,
    );

    expect(security.ok).toBe(false);

    if (!security.ok) {
      expect(security.reason).toBe("security");
    }
  });

  it("reports read failures and clears the key", () => {
    const blocked = createStorage();
    blocked.getItem = () => {
      throw new Error("blocked");
    };

    expect(loadStudyStateFromStorage(blocked, fingerprint).status).toBe("unavailable");

    const storage = createStorage(envelope());
    expect(clearStudyStateFromStorage(storage).ok).toBe(true);
    expect(storage.values.has(STUDY_STORAGE_KEY)).toBe(false);
  });
});
