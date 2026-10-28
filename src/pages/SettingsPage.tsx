import { Download, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Callout } from "../components/ui/Callout";
import { PageHeader } from "../components/ui/PageHeader";
import { ThemePreferenceForm } from "../components/theme/ThemePreferenceForm";
import { contentFingerprint } from "../content/fingerprint";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useTheme } from "../hooks/useTheme";
import { downloadTextFile } from "../lib/download";
import { clearThemePreference, THEME_STORAGE_KEY } from "../lib/theme";
import {
  STUDY_SCHEMA_VERSION,
  STUDY_STORAGE_KEY,
} from "../persistence/storage";
import { resetStudyData, useStudyState } from "../persistence/study-store";

function backupFilename(): string {
  return `cfl-study-${new Date().toISOString().slice(0, 10)}.json`;
}

export function SettingsPage() {
  useDocumentTitle("Settings");

  const { preference, resolved, setPreference } = useTheme();
  const snapshot = useStudyState();
  const [statusMessage, setStatusMessage] = useState("");
  const [confirmingReset, setConfirmingReset] = useState(false);
  const confirmResetRef = useRef<HTMLButtonElement>(null);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const wasConfirmingResetRef = useRef(false);

  useEffect(() => {
    if (confirmingReset) {
      wasConfirmingResetRef.current = true;
      confirmResetRef.current?.focus();
      return;
    }

    if (wasConfirmingResetRef.current) {
      wasConfirmingResetRef.current = false;
      resetTriggerRef.current?.focus();
    }
  }, [confirmingReset]);

  const resetPreferences = () => {
    clearThemePreference();
    setPreference("dark");
    setStatusMessage("Preferences reset. The theme is back to Dark.");
  };

  const downloadStudyBackup = () => {
    const payload = {
      schemaVersion: STUDY_SCHEMA_VERSION,
      contentFingerprint,
      savedAt: snapshot.savedAt ?? new Date().toISOString(),
      state: snapshot.state,
    };

    downloadTextFile(backupFilename(), JSON.stringify(payload, null, 2));
    setStatusMessage("Study backup downloaded.");
  };

  const submittedAttempts = snapshot.state.attempts.filter(
    (attempt) => attempt.session.status === "submitted",
  ).length;
  const activeAttempts = snapshot.state.attempts.length - submittedAttempts;

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
          <span className="section-note">
            {snapshot.storageAvailable ? "Storage available" : "Storage unavailable"}
          </span>
        </div>
        <dl className="key-value card">
          <dt>Theme key</dt>
          <dd>
            <code>{THEME_STORAGE_KEY}</code> = {preference}
          </dd>
          <dt>Resolved theme</dt>
          <dd>{resolved}</dd>
          <dt>Study key</dt>
          <dd>
            <code>{STUDY_STORAGE_KEY}</code> · schema v{STUDY_SCHEMA_VERSION}
          </dd>
          <dt>Content fingerprint</dt>
          <dd>
            <code>{contentFingerprint}</code>
          </dd>
          <dt>Storage status</dt>
          <dd>
            {snapshot.status}
            {snapshot.savedAt ? ` · last saved ${snapshot.savedAt}` : ""}
          </dd>
          <dt>Saved attempts</dt>
          <dd>
            {snapshot.state.attempts.length} total · {submittedAttempts} submitted ·{" "}
            {activeAttempts} in progress
          </dd>
          <dt>Review resolutions</dt>
          <dd>{snapshot.state.reviewResolutions.length}</dd>
          <dt>Account</dt>
          <dd>None. No analytics, no sync, no network calls from the UI</dd>
        </dl>

        {snapshot.writeError ? (
          <p className="study-alert" role="alert">
            {snapshot.writeError}
          </p>
        ) : null}

        <div className="quiz-actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={downloadStudyBackup}
            disabled={snapshot.state.attempts.length === 0 && snapshot.state.reviewResolutions.length === 0}
          >
            <Download size={14} strokeWidth={2} aria-hidden="true" />
            Download study backup
          </button>
          <button type="button" className="button button--secondary" onClick={resetPreferences}>
            <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
            Reset preferences
          </button>
          <p className="section-note" role="status" aria-live="polite">
            {statusMessage}
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="reset-study-heading">
        <div className="section-heading-row">
          <h2 className="section-title" id="reset-study-heading">
            Reset study data
          </h2>
          <span className="section-note">Attempts and review resolutions only</span>
        </div>

        <Callout tone="caution" title="This cannot be undone">
          Resetting removes every saved attempt and review resolution from{" "}
          <code>{STUDY_STORAGE_KEY}</code> in this browser. The theme preference and authored content
          are untouched. Download a backup first if you want to keep the raw data.
        </Callout>

        <div className="quiz-actions">
          {confirmingReset ? (
            <>
              <button
                ref={confirmResetRef}
                type="button"
                className="button button--primary"
                onClick={() => {
                  resetStudyData();
                  setConfirmingReset(false);
                  setStatusMessage("Study data reset. No attempts or review resolutions remain.");
                }}
              >
                Confirm reset study data
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setConfirmingReset(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              ref={resetTriggerRef}
              type="button"
              className="button button--secondary"
              onClick={() => setConfirmingReset(true)}
            >
              <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
              Reset study data
            </button>
          )}
        </div>
      </section>

      <section className="section">
        <Callout tone="note" title="Content notice">
          Practice sets and the mock-exam preview are original learning material mapped to the
          verified blueprint. They are not official CCAO-F questions and do not reproduce exam
          content. Explanations are in Vietnamese; question stems and choices are in English.
        </Callout>
      </section>
    </div>
  );
}
