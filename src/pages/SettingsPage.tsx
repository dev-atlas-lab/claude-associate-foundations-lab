import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { Callout } from "../components/ui/Callout";
import { PageHeader } from "../components/ui/PageHeader";
import { ThemePreferenceForm } from "../components/theme/ThemePreferenceForm";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useTheme } from "../hooks/useTheme";
import { clearThemePreference, THEME_STORAGE_KEY } from "../lib/theme";

export function SettingsPage() {
  useDocumentTitle("Settings");

  const { preference, resolved, setPreference } = useTheme();
  const [statusMessage, setStatusMessage] = useState("");

  const resetPreferences = () => {
    clearThemePreference();
    setPreference("dark");
    setStatusMessage("Preferences reset. The theme is back to Dark.");
  };

  return (
    <div className="page page--narrow">
      <PageHeader
        eyebrow="Settings"
        title="Preferences"
        lede="Everything here is stored in this browser only. There is no account to manage and no server to sync with."
      />

      <section className="section" aria-labelledby="appearance-heading">
        <div className="section-heading-row">
          <h2 className="section-title" id="appearance-heading">
            Appearance
          </h2>
          <span className="section-note">Dark, Light, or follow the system</span>
        </div>
        <ThemePreferenceForm />
      </section>

      <section className="section" aria-labelledby="local-data-heading">
        <div className="section-heading-row">
          <h2 className="section-title" id="local-data-heading">
            Local data
          </h2>
        </div>
        <dl className="key-value card">
          <dt>Theme key</dt>
          <dd>
            <code>{THEME_STORAGE_KEY}</code> = {preference}
          </dd>
          <dt>Resolved theme</dt>
          <dd>{resolved}</dd>
          <dt>Learning progress</dt>
          <dd>Not implemented — no progress data is stored yet</dd>
          <dt>Account</dt>
          <dd>None. No analytics, no sync, no network calls from the UI</dd>
        </dl>

        <div className="quiz-actions">
          <button type="button" className="button button--secondary" onClick={resetPreferences}>
            <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
            Reset preferences
          </button>
          <p className="section-note" role="status" aria-live="polite">
            {statusMessage}
          </p>
        </div>
      </section>

      <section className="section">
        <Callout tone="note" title="Sample content notice">
          This build includes one sample lesson to validate the reading layout, diagram, and
          knowledge-check behaviour. It is not an official exam objective and makes no coverage
          claim.
        </Callout>
      </section>
    </div>
  );
}
