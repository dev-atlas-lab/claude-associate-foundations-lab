import { Clock, Timer } from "lucide-react";
import { formatLocalTimestamp, formatRemainingClock, spokenRemaining } from "../format";

interface TimerBarProps {
  remainingSeconds: number;
  deadlineAt: string;
  expired: boolean;
}

function timerState(remainingSeconds: number, expired: boolean): "expired" | "critical" | "warning" | "normal" {
  if (expired || remainingSeconds <= 0) {
    return "expired";
  }

  if (remainingSeconds <= 300) {
    return "critical";
  }

  if (remainingSeconds <= 600) {
    return "warning";
  }

  return "normal";
}

export function TimerBar({ remainingSeconds, deadlineAt, expired }: TimerBarProps) {
  const state = timerState(remainingSeconds, expired);

  return (
    <div className="timed-clock" data-state={state} aria-labelledby="timed-clock-label">
      <div className="timed-clock-main">
        <span className="timed-clock-icon" aria-hidden="true">
          <Timer size={16} strokeWidth={1.9} />
        </span>
        <span className="timed-clock-copy">
          <span className="timed-clock-label" id="timed-clock-label">
            Time remaining
          </span>
          <span
            className="timed-clock-value"
            role="timer"
            aria-live="off"
            aria-atomic="true"
            aria-label={`Time remaining: ${spokenRemaining(remainingSeconds)}`}
          >
            {formatRemainingClock(remainingSeconds)}
          </span>
        </span>
      </div>

      <div className="timed-clock-meta">
        <span className="timed-clock-deadline">
          <Clock size={12} strokeWidth={1.9} aria-hidden="true" />
          Ends {formatLocalTimestamp(deadlineAt)}
        </span>
        {state === "warning" || state === "critical" ? (
          <span className="timed-clock-warning">Time is running low</span>
        ) : null}
        {state === "expired" ? (
          <span className="timed-clock-warning">Time is up</span>
        ) : null}
      </div>
    </div>
  );
}
