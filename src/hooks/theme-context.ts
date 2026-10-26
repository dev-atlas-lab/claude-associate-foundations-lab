import { createContext } from "react";
import type { ResolvedTheme, ThemePreference } from "../lib/theme";

export type ThemeContextValue = {
  /** The user's stored choice: dark, light, or system. */
  preference: ThemePreference;
  /** The theme actually rendered after resolving "system". */
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
