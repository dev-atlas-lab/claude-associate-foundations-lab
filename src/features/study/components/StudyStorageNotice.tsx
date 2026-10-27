import { Download, RotateCcw, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { downloadTextFile } from "../../../lib/download";
import { resetStudyData, useStudyState } from "../../../persistence/study-store";

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
    <aside
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

        <div className="storage-notice-actions">
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
                  type="button"
                  className="button button--primary button--sm"
                  onClick={() => {
                    resetStudyData();
                    setConfirmingReset(false);
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
    </aside>
  );
}
