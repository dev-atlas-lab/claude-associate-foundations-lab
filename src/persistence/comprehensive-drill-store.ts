import { useSyncExternalStore } from "react";
import { z } from "zod";

export const COMPREHENSIVE_DRILL_STORAGE_KEY = "cfl.comprehensive-drill.v1";
export const DRILL_SCHEMA_VERSION = 1;

export const comprehensiveDrillStateSchema = z.object({
  version: z.literal(DRILL_SCHEMA_VERSION),
  answers: z.record(z.string(), z.array(z.string())),
  revealed: z.record(z.string(), z.boolean()),
  flags: z.record(z.string(), z.boolean()),
  lastActiveQuestionId: z.string().optional(),
  lastUpdated: z.string(),
});

export type ComprehensiveDrillState = z.infer<typeof comprehensiveDrillStateSchema>;

export const defaultDrillState: ComprehensiveDrillState = {
  version: DRILL_SCHEMA_VERSION,
  answers: {},
  revealed: {},
  flags: {},
  lastUpdated: new Date().toISOString(),
};

function getStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function loadStoredState(): ComprehensiveDrillState {
  const storage = getStorage();
  if (!storage) {
    return defaultDrillState;
  }

  try {
    const raw = storage.getItem(COMPREHENSIVE_DRILL_STORAGE_KEY);
    if (!raw) {
      return defaultDrillState;
    }
    const parsed = JSON.parse(raw);
    const result = comprehensiveDrillStateSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    return defaultDrillState;
  } catch {
    return defaultDrillState;
  }
}

function saveState(state: ComprehensiveDrillState): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(COMPREHENSIVE_DRILL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota or permission blocked; ignore gracefully
  }
}

// In-memory state and subscriber registry
let currentState: ComprehensiveDrillState = loadStoredState();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export const comprehensiveDrillStore = {
  getState(): ComprehensiveDrillState {
    return currentState;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  selectChoice(
    questionId: string,
    choiceId: string,
    isMultipleResponse: boolean,
  ): void {
    const prevAnswers = currentState.answers[questionId] ?? [];
    let nextAnswers: string[];

    if (isMultipleResponse) {
      if (prevAnswers.includes(choiceId)) {
        nextAnswers = prevAnswers.filter((id) => id !== choiceId);
      } else {
        nextAnswers = [...prevAnswers, choiceId];
      }
    } else {
      nextAnswers = [choiceId];
    }

    // For single-choice, auto-reveal explanation immediately
    const nextRevealed = {
      ...currentState.revealed,
      [questionId]: isMultipleResponse
        ? currentState.revealed[questionId] ?? false
        : true,
    };

    currentState = {
      ...currentState,
      answers: {
        ...currentState.answers,
        [questionId]: nextAnswers,
      },
      revealed: nextRevealed,
      lastActiveQuestionId: questionId,
      lastUpdated: new Date().toISOString(),
    };

    saveState(currentState);
    notify();
  },

  revealAnswer(questionId: string): void {
    currentState = {
      ...currentState,
      revealed: {
        ...currentState.revealed,
        [questionId]: true,
      },
      lastActiveQuestionId: questionId,
      lastUpdated: new Date().toISOString(),
    };

    saveState(currentState);
    notify();
  },

  retryQuestion(questionId: string): void {
    const nextAnswers = { ...currentState.answers };
    delete nextAnswers[questionId];

    const nextRevealed = { ...currentState.revealed };
    delete nextRevealed[questionId];

    currentState = {
      ...currentState,
      answers: nextAnswers,
      revealed: nextRevealed,
      lastActiveQuestionId: questionId,
      lastUpdated: new Date().toISOString(),
    };

    saveState(currentState);
    notify();
  },

  toggleFlag(questionId: string): void {
    const isFlagged = !currentState.flags[questionId];
    const nextFlags = { ...currentState.flags };

    if (isFlagged) {
      nextFlags[questionId] = true;
    } else {
      delete nextFlags[questionId];
    }

    currentState = {
      ...currentState,
      flags: nextFlags,
      lastActiveQuestionId: questionId,
      lastUpdated: new Date().toISOString(),
    };

    saveState(currentState);
    notify();
  },

  setLastActiveQuestionId(questionId: string): void {
    if (currentState.lastActiveQuestionId === questionId) {
      return;
    }
    currentState = {
      ...currentState,
      lastActiveQuestionId: questionId,
    };
    saveState(currentState);
    notify();
  },

  resetAll(): void {
    currentState = {
      ...defaultDrillState,
      lastUpdated: new Date().toISOString(),
    };
    saveState(currentState);
    notify();
  },
};

export function useComprehensiveDrill(): ComprehensiveDrillState {
  return useSyncExternalStore(
    comprehensiveDrillStore.subscribe,
    comprehensiveDrillStore.getState,
    () => defaultDrillState,
  );
}
