import { Check, Download, RotateCcw, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { downloadTextFile } from "../../../lib/download";
import {
  migrateCompatibleStudyData,
  resetStudyData,
  useStudyState,
} from "../../../persistence/study-store";

function backupFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `cfl-study-backup-${stamp}.json`;
}

/**
 * Recovery surface for saved-data problems. A corrupt or incompatible store
 * blocks new writes until the learner downloads the recoverable payload and
 * explicitly resets; nothing is deleted automatically.
 */
export function StudyStorageNotice() {
  const snapshot = useStudyState();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const wasConfirmingRef = useRef(false);

  useEffect(() => {
    if (confirmingReset) {
      wasConfirmingRef.current = true;
      confirmButtonRef.current?.focus();
      return;
    }

    if (wasConfirmingRef.current) {
      wasConfirmingRef.current = false;
      resetButtonRef.current?.focus();
    }
  }, [confirmingReset]);

  const blocking = snapshot.status === "corrupt" || snapshot.status === "incompatible";
  const hasIssue =
    blocking || snapshot.status === "unavailable" || snapshot.writeError !== undefined;

  if (!hasIssue) {
    return null;
  }

  const title = blocking
    ? "Saved study data needs attention"
    : snapshot.status === "unavailable"
      ? "Local storage is unavailable"
      : "The latest change was not saved";

  const message = blocking
    ? snapshot.message
    : snapshot.status === "unavailable"
      ? (snapshot.message ??
        "This browser is not allowing local storage. Attempts still work in memory, but they are lost on refresh.")
      : snapshot.writeError;

  return (
    <div
      className="storage-notice"
      data-tone={blocking ? "blocking" : "warning"}
      aria-labelledby="storage-notice-title"
      role={blocking ? "alert" : "status"}
    >
      <span className="storage-notice-icon" aria-hidden="true">
        <ShieldAlert size={17} strokeWidth={1.9} />
      </span>
      <div className="storage-notice-body">
        <h2 className="storage-notice-title" id="storage-notice-title">
          {title}
        </h2>
        <p className="storage-notice-text">{message}</p>
        {blocking ? (
          <p className="storage-notice-text">
            New attempts are blocked so saved answers cannot be overwritten. Download the raw data
            first, then reset when you are ready. Resetting clears only study attempts and review
            resolutions in this browser.
          </p>
        ) : null}
        {snapshot.status === "incompatible" && snapshot.migrationPlan?.canMigrate ? (
          <p className="storage-notice-text">
            {snapshot.migrationPlan.compatibleAttempts.length} saved{" "}
            {snapshot.migrationPlan.compatibleAttempts.length === 1 ? "attempt" : "attempts"} still{" "}
            {snapshot.migrationPlan.compatibleAttempts.length === 1 ? "matches" : "match"} the
            current questions and answer keys and can be migrated safely
            {snapshot.migrationPlan.droppedAttempts > 0
              ? ` (${snapshot.migrationPlan.droppedAttempts} incompatible ${snapshot.migrationPlan.droppedAttempts === 1 ? "attempt" : "attempts"} will be skipped)`
              : ""}
            .
          </p>
        ) : null}

        <div className="storage-notice-actions">
          {snapshot.status === "incompatible" && snapshot.migrationPlan?.canMigrate ? (
            <button
              type="button"
              className="button button--primary button--sm"
              onClick={() => {
                migrateCompatibleStudyData();
                document
                  .getElementById("main-content")
                  ?.focus({ preventScroll: true });
              }}
            >
              <Check size={13} strokeWidth={2} aria-hidden="true" />
              Migrate compatible attempts ({snapshot.migrationPlan.compatibleAttempts.length})
            </button>
          ) : null}

          {snapshot.rawBackup ? (
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={() => downloadTextFile(backupFilename(), snapshot.rawBackup ?? "")}
            >
              <Download size={13} strokeWidth={2} aria-hidden="true" />
              Download raw backup
            </button>
          ) : null}

          {blocking || snapshot.status === "unavailable" ? (
            confirmingReset ? (
              <>
                <button
                  ref={confirmButtonRef}
                  type="button"
                  className="button button--primary button--sm"
                  onClick={() => {
                    resetStudyData();
                    setConfirmingReset(false);
                    // The notice disappears after a successful reset, so keep
                    // focus inside the content region rather than on <body>.
                    document
                      .getElementById("main-content")
                      ?.focus({ preventScroll: true });
                  }}
                >
                  Confirm reset
                </button>
                <button
                  type="button"
                  className="button button--ghost button--sm"
                  onClick={() => setConfirmingReset(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                ref={resetButtonRef}
                type="button"
                className="button button--secondary button--sm"
                onClick={() => setConfirmingReset(true)}
              >
                <RotateCcw size={13} strokeWidth={2} aria-hidden="true" />
                Reset local data
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
