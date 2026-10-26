import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import type { ThemePreference } from "../../lib/theme";

const options: {
  value: ThemePreference;
  name: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  {
    value: "dark",
    name: "Dark",
    hint: "Default. Layered dark surfaces for long study sessions.",
    icon: Moon,
  },
  {
    value: "light",
    name: "Light",
    hint: "Paper-like light surfaces for bright rooms.",
    icon: Sun,
  },
  {
    value: "system",
    name: "System",
    hint: "Follows the operating-system colour preference and updates live.",
    icon: Monitor,
  },
];

export function ThemePreferenceForm() {
  const { preference, resolved, setPreference } = useTheme();

  return (
    <div className="stack">
      <fieldset className="fieldset">
        <legend className="field-label">Theme</legend>
        <div className="theme-options">
          {options.map(({ value, name, hint, icon: Icon }) => (
            <label className="theme-option" key={value}>
              <input
                type="radio"
                name="theme-preference"
                value={value}
                checked={preference === value}
                onChange={() => setPreference(value)}
              />
              <span className="theme-option-body">
                <span className="theme-option-name">
                  <Icon size={15} strokeWidth={1.9} aria-hidden="true" />
                  {name}
                  {value === "system" && preference === "system" ? (
                    <span className="badge">now {resolved}</span>
                  ) : null}
                </span>
                <span className="theme-option-hint">{hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="section-note">
        Saved in this browser under <code>cfl.theme</code>. Currently rendering the{" "}
        <strong>{resolved}</strong> theme.
      </p>
    </div>
  );
}
