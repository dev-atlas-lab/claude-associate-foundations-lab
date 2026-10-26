import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import type { ThemePreference } from "../../lib/theme";

const options: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "light", label: "Light theme", icon: Sun },
  { value: "system", label: "System theme", icon: Monitor },
];

export function ThemeSwitcher() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="theme-switcher" role="group" aria-label="Theme">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className="theme-switcher-button"
          aria-label={label}
          aria-pressed={preference === value}
          title={label}
          onClick={() => setPreference(value)}
        >
          <Icon size={14} strokeWidth={1.9} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
