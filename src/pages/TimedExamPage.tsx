import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import {
  timedExamDurationMinutes,
  timedExamEligibility,
  timedExamRequestedItemCount,
} from "../content/timed-exam";
import {
  TimedExamRecovery,
} from "../features/timed-exam/components/TimedExamRecovery";
import { TimedExamRunner } from "../features/timed-exam/components/TimedExamRunner";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  discardTimedExam,
  saveTimedExamSession,
  startTimedExam,
  TimedExamStoreError,
  useTimedExamState,
} from "../persistence/timed-exam-store";
import type { TimedExamSession } from "../domain";

function storageWarningFor(
  status: ReturnType<typeof useTimedExamState>["status"],
  message: string | undefined,
  writeError: string | undefined,
): string | undefined {
  if (status === "unavailable") {
    return message
      ? `${message} The timed exam can continue in this tab, but it will not be restored after a reload.`
      : "Local storage is unavailable. The timed exam can continue in this tab, but it will not be restored after a reload.";
  }

  return writeError;
}

export function TimedExamPage() {
  useDocumentTitle("Timed mock exam");
  const snapshot = useTimedExamState();
  const blocked = snapshot.status === "corrupt" || snapshot.status === "incompatible";
  const storageWarning = storageWarningFor(
    snapshot.status,
    snapshot.message,
    snapshot.writeError,
  );

  const handleStart = (session: TimedExamSession) => {
    try {
      startTimedExam(session);
      return { ok: true };
    } catch (error) {
      if (error instanceof TimedExamStoreError) {
        return { ok: false, message: error.message };
      }

      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "The timed exam could not be started.",
      };
    }
  };

  const handleDiscard = () => {
    const outcome = discardTimedExam();

    return outcome.ok ? { ok: true } : { ok: false, message: outcome.message };
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Assessment"
        title="Timed mock exam"
        lede="A full-length, deadline-enforced simulation over the reviewed question bank. The same attempt and its original deadline are restored after a refresh; answers lock at submission and the result stays raw."
        meta={
          <>
            <Badge tone="ok">
              {timedExamRequestedItemCount} items · {timedExamDurationMinutes} min
            </Badge>
            <Badge tone="warn">Original practice content</Badge>
            <Badge>Saved locally</Badge>
          </>
        }
      />

      {blocked ? (
        <TimedExamRecovery
          message={
            snapshot.message ??
            "The saved timed exam cannot be read with the current content."
          }
          rawBackup={snapshot.rawBackup}
          storedVersion={snapshot.storedVersion}
          storedFingerprint={snapshot.storedFingerprint}
          onDiscard={handleDiscard}
        />
      ) : (
        <>
          {snapshot.status === "unavailable" ? (
            <p className="study-alert" role="alert">
              {storageWarning}
            </p>
          ) : null}

          <TimedExamRunner
            session={snapshot.session}
            storageWarning={
              snapshot.status === "unavailable" ? undefined : storageWarning
            }
            onStart={handleStart}
            onSave={saveTimedExamSession}
            onDiscard={handleDiscard}
          />
        </>
      )}

      <section className="section" aria-labelledby="timed-exam-scope">
        <div className="section-heading-row">
          <h2 className="section-title" id="timed-exam-scope">
            Scope and scoring
          </h2>
          <span className="section-note">
            {timedExamEligibility.availableItemCount} reviewed items available
          </span>
        </div>
        <p className="study-note">
          Allocation uses the verified blueprint weights and caps at the reviewed items available in
          each domain. If the bank cannot fill all {timedExamRequestedItemCount} slots, starting is
          disabled and the exact shortfall is shown; no question is duplicated or invented. Single
          choice and exact-set multiple response are scored all-or-nothing, with unanswered reported
          separately from incorrect. The percentage is raw performance only, not an official scaled
          score or a pass prediction.
        </p>
      </section>
    </div>
  );
}
