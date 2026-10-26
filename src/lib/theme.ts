export const THEME_STORAGE_KEY = "cfl.theme";

export const THEME_PREFERENCES = ["dark", "light", "system"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = "dark" | "light";

/** Dark is the product default: a new visitor always lands on the dark theme. */
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "dark";

export type ThemeStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && (THEME_PREFERENCES as readonly string[]).includes(value);
}

function resolveStorage(storage?: ThemeStorage | null): ThemeStorage | null {
  if (storage !== undefined) {
    return storage;
  }

  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readThemePreference(storage?: ThemeStorage | null): ThemePreference {
  try {
    const store = resolveStorage(storage);
    const stored = store?.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : DEFAULT_THEME_PREFERENCE;
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
}

export function writeThemePreference(
  preference: ThemePreference,
  storage?: ThemeStorage | null,
): void {
  try {
    resolveStorage(storage)?.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage can be unavailable (private browsing, blocked cookies). The
    // in-memory theme still works for this session.
  }
}

export function clearThemePreference(storage?: ThemeStorage | null): void {
  try {
    resolveStorage(storage)?.removeItem(THEME_STORAGE_KEY);
  } catch {
    // Ignore storage failures; the caller still resets in-memory state.
  }
}

/** Resolve the preference against the operating-system setting. */
export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  if (preference === "system") {
    return prefersDark ? "dark" : "light";
  }

  return preference;
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return true;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Apply the resolved theme to <html>. Doing this through data attributes keeps
 * every colour in CSS, so no component needs to know which theme is active.
 */
export function applyTheme(
  resolved: ResolvedTheme,
  preference: ThemePreference,
  root?: HTMLElement | null,
): void {
  const element = root ?? (typeof document === "undefined" ? null : document.documentElement);

  if (!element) {
    return;
  }

  element.dataset.theme = resolved;
  element.dataset.themePreference = preference;
  element.style.colorScheme = resolved;
}
