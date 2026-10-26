import { vi } from "vitest";

export type MatchMediaController = {
  setPrefersDark: (value: boolean) => void;
};

/**
 * jsdom has no prefers-color-scheme support, so tests install a controllable
 * MediaQueryList and can flip the operating-system value at will.
 */
export function installMatchMedia(prefersDark: boolean): MatchMediaController {
  let current = prefersDark;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  const query = {
    get matches() {
      return current;
    },
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;

  window.matchMedia = vi.fn(() => query) as unknown as typeof window.matchMedia;

  return {
    setPrefersDark(value: boolean) {
      current = value;
      const event = { matches: value, media: query.media } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}
