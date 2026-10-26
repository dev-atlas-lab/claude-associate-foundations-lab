import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  applyTheme,
  getSystemPrefersDark,
  readThemePreference,
  resolveTheme,
  writeThemePreference,
  type ThemePreference,
} from "../lib/theme";
import { ThemeContext } from "./theme-context";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => readThemePreference());
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => getSystemPrefersDark());

  const resolved = resolveTheme(preference, systemPrefersDark);

  useEffect(() => {
    applyTheme(resolved, preference);
  }, [resolved, preference]);

  useEffect(() => {
    writeThemePreference(preference);
  }, [preference]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia(DARK_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handleChange);
      return () => query.removeEventListener("change", handleChange);
    }

    // Safari < 14 fallback.
    query.addListener(handleChange);
    return () => query.removeListener(handleChange);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
