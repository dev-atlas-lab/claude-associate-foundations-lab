import { Download, RotateCcw, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { downloadTextFile } from "../../../lib/download";

interface TimedExamRecoveryProps {
  message: string;
  rawBackup?: string;
  storedVersion?: number;
  storedFingerprint?: string;
  onDiscard: () => { ok: boolean; message?: string };
}

function backupFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `cfl-timed-exam-backup-${stamp}.json`;
}

/**
 * Recovery surface for corrupt, incompatible, or content-mismatched timed-exam
 * data. Nothing is discarded, migrated, or scored automatically.
 */
export function TimedExamRecovery({
  message,
  rawBackup,
  storedVersion,
  storedFingerprint,
  onDiscard,
}: TimedExamRecoveryProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const discardButtonRef = useRef<HTMLButtonElement>(null);
  const wasConfirmingRef = useRef(false);

  useEffect(() => {
    if (confirming) {
      confirmButtonRef.current?.focus();
    } else if (wasConfirmingRef.current) {
      discardButtonRef.current?.focus();
    }

    wasConfirmingRef.current = confirming;
  }, [confirming]);

  const handleDiscard = () => {
    const outcome = onDiscard();

    if (!outcome.ok) {
      setError(outcome.message ?? "The saved timed exam could not be discarded.");
      return;
    }

    document.getElementById("main-content")?.focus({ preventScroll: true });
  };

  return (
    <section className="timed-recovery" aria-labelledby="timed-recovery-title">
      <span className="timed-recovery-icon" aria-hidden="true">
        <ShieldAlert size={18} strokeWidth={1.9} />
      </span>
      <div className="timed-recovery-body">
        <h2 className="timed-recovery-title" id="timed-recovery-title">
          Saved timed exam needs attention
        </h2>
        <p className="timed-recovery-text">{message}</p>
        <p className="timed-recovery-text">
          Nothing was resumed or scored. The saved payload is kept in this browser until you discard
          it. Discarding removes only the timed-exam key <code>cfl.timed-exam.v1</code>; Practice
          attempts and review items in <code>cfl.study.v1</code> are not changed.
        </p>

        {storedVersion !== undefined || storedFingerprint !== undefined ? (
          <dl className="timed-recovery-meta">
            {storedVersion !== undefined ? (
              <>
                <dt>Stored schema</dt>
                <dd>{storedVersion}</dd>
              </>
            ) : null}
            {storedFingerprint !== undefined ? (
              <>
                <dt>Stored fingerprint</dt>
                <dd>
                  <code>{storedFingerprint}</code>
                </dd>
              </>
            ) : null}
          </dl>
        ) : null}

        {error ? (
          <p className="study-alert" role="alert">
            {error}
          </p>
        ) : null}

        <div className="storage-notice-actions">
          {rawBackup ? (
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={() => downloadTextFile(backupFilename(), rawBackup)}
            >
              <Download size={13} strokeWidth={2} aria-hidden="true" />
              Download raw backup
            </button>
          ) : null}

          {confirming ? (
            <>
              <button
                ref={confirmButtonRef}
                type="button"
                className="button button--primary button--sm"
                onClick={handleDiscard}
              >
                Confirm discard timed exam
              </button>
              <button
                type="button"
                className="button button--ghost button--sm"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              ref={discardButtonRef}
              type="button"
              className="button button--secondary button--sm"
              onClick={() => setConfirming(true)}
            >
              <RotateCcw size={13} strokeWidth={2} aria-hidden="true" />
              Discard saved timed exam
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
