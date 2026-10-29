import { describe, expect, it } from "vitest";
import { allQuestions, assessments, getAssessment, getAssessmentQuestions } from "../content";
import {
  chooseAnswer,
  createAssessmentContext,
  createStudyAttempt,
  emptyStudyState,
  startAssessment,
  submitAssessment,
} from "../domain";
import {
  STUDY_SCHEMA_VERSION,
  STUDY_STORAGE_KEY,
  clearStudyStateFromStorage,
  inspectCompatibleStudyMigration,
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

  it("extracts compatible submitted and matching in-progress attempts from a stale-fingerprint v1 envelope while dropping mismatched in-progress attempts", () => {
    const questionsById = new Map(allQuestions.map((question) => [question.id, question]));
    const assessmentsById = new Map(assessments.map((assessment) => [assessment.id, assessment]));

    const d5Def = getAssessment("domain-5-configuration-set")!;
    const d5Questions = getAssessmentQuestions(d5Def);
    const d5Context = createAssessmentContext(d5Def, d5Questions);
    let submittedSession = startAssessment(d5Context, {
      sessionId: "d5-submitted-old",
      startedAt: "2026-10-27T08:00:00.000Z",
    });
    submittedSession = chooseAnswer(
      d5Context,
      submittedSession,
      d5Questions[0]!.id,
      d5Questions[0]!.correctChoiceIds,
    );
    submittedSession = submitAssessment(
      d5Context,
      submittedSession,
      "2026-10-27T08:05:00.000Z",
    ).session;
    const validSubmittedAttempt = createStudyAttempt(d5Def, submittedSession, {
      kind: "practice",
      practiceSetId: d5Def.id,
    });

    // An in-progress attempt whose questionIds no longer match the current assessment definition (e.g. an older subset)
    const subsetDef = {
      ...d5Def,
      questionIds: d5Def.questionIds.slice(0, 4),
    };
    const subsetContext = createAssessmentContext(subsetDef, d5Questions.slice(0, 4));
    const mismatchedActiveSession = startAssessment(subsetContext, {
      sessionId: "d5-active-mismatched",
      startedAt: "2026-10-27T09:00:00.000Z",
    });
    const mismatchedActiveAttempt = createStudyAttempt(subsetDef, mismatchedActiveSession, {
      kind: "practice",
      practiceSetId: d5Def.id,
    });

    const staleRaw = envelope({
      contentFingerprint: "study-v1-older-bank",
      state: {
        attempts: [validSubmittedAttempt, mismatchedActiveAttempt],
        reviewResolutions: [
          {
            attemptId: "d5-submitted-old",
            questionId: d5Questions[1]!.id,
            resolvedAt: "2026-10-27T08:06:00.000Z",
          },
          {
            attemptId: "d5-active-mismatched",
            questionId: d5Questions[0]!.id,
            resolvedAt: "2026-10-27T09:01:00.000Z",
          },
        ],
      },
    });

    const plan = inspectCompatibleStudyMigration(
      staleRaw,
      STUDY_SCHEMA_VERSION,
      "study-v1-older-bank",
      fingerprint,
      questionsById,
      assessmentsById,
    );

    expect(plan.canMigrate).toBe(true);
    expect(plan.compatibleAttempts).toHaveLength(1);
    expect(plan.compatibleAttempts[0]?.session.id).toBe("d5-submitted-old");
    expect(plan.droppedAttempts).toBe(1);
    expect(plan.compatibleResolutions).toHaveLength(1);
    expect(plan.compatibleResolutions[0]?.attemptId).toBe("d5-submitted-old");
  });
});
