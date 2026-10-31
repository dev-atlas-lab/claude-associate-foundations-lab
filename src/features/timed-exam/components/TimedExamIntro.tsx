import { Play, ShieldAlert, Timer } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Callout } from "../../../components/ui/Callout";

export type TimedExamPresetChoice = "set-1" | "set-2" | "random";

export interface TimedExamAllocationView {
  domainId: string;
  weightPercent: number;
  available: number;
  allocated: number;
}

interface TimedExamIntroProps {
  requestedItemCount: number;
  durationMinutes: number;
  availableItemCount: number;
  selectedItemCount: number;
  shortfall: number;
  allocations: readonly TimedExamAllocationView[];
  domains: readonly { id: string; code: string; title: string }[];
  canStart: boolean;
  storageWarning?: string;
  startError?: string;
  onStart: (preset: TimedExamPresetChoice) => void;
}

export function TimedExamIntro({
  requestedItemCount,
  durationMinutes,
  availableItemCount,
  selectedItemCount,
  shortfall,
  allocations,
  domains,
  canStart,
  storageWarning,
  startError,
  onStart,
}: TimedExamIntroProps) {
  const [selectedPreset, setSelectedPreset] = useState<TimedExamPresetChoice>("set-1");
  const domainById = new Map(domains.map((domain) => [domain.id, domain]));

  return (
    <section className="assessment-start timed-intro" aria-labelledby="timed-exam-start-title">
      <div className="assessment-start-head">
        <span className="assessment-kicker">Timed simulation</span>
        <h2 className="assessment-start-title" id="timed-exam-start-title">
          CCAO-F timed mock exam
        </h2>
        <p className="assessment-start-copy">
          A full-length simulation over the reviewed question bank. The countdown is enforced from a
          saved deadline, answers are locked at submission, and the result is raw performance only.
          This is original practice content, not an official exam or a pass prediction.
        </p>
      </div>

      <div className="assessment-meta">
        <Badge tone="ok">
          <Timer size={12} strokeWidth={2} aria-hidden="true" /> {requestedItemCount} questions
        </Badge>
        <Badge tone="ok">{durationMinutes} minutes</Badge>
        <Badge>{availableItemCount} reviewed items available</Badge>
        <Badge tone="warn">Not official exam content</Badge>
      </div>

      <div className="assessment-instructions">
        <h3 className="assessment-instructions-title" lang="en">
          Before you start
        </h3>
        <ul className="bullet-list" lang="en">
          <li>
            You have {durationMinutes} minutes for {requestedItemCount} questions. The timer starts
            when you begin and cannot be paused.
          </li>
          <li>
            Single-choice questions accept one answer. Multiple-response questions require the exact
            set of correct answers; there is no partial credit.
          </li>
          <li>
            You can navigate between questions, flag questions, and change answers before you submit.
            A question navigator shows answered, unanswered, and flagged items.
          </li>
          <li>
            You may submit early after a confirmation. When the deadline is reached, the exam submits
            automatically, even if this tab was in the background.
          </li>
          <li>
            Leaving this page does not stop the clock. Return before the deadline and the same
            attempt resumes with the original question order and deadline.
          </li>
          <li>
            The result is a raw percentage of correctly answered questions. It is not an official
            scaled score on the 100–1,000 range and does not predict pass or fail.
          </li>
          <li>
            Questions, instructions, and full option-by-option explanations are provided in English.
          </li>
        </ul>
      </div>

      {storageWarning ? (
        <p className="study-alert" role="alert">
          <ShieldAlert size={15} strokeWidth={2} aria-hidden="true" /> {storageWarning}
        </p>
      ) : null}

      {startError ? (
        <p className="study-alert" role="alert">
          {startError}
        </p>
      ) : null}

      {shortfall > 0 ? (
        <Callout tone="caution" title="Not enough reviewed questions to start">
          The simulation needs {requestedItemCount} eligible reviewed questions. The registry
          currently has {availableItemCount}, so the exam would be short by {shortfall}. It will not
          pad the exam with duplicate or invented questions. Add reviewed bank items or lower the
          item count after an official blueprint review.
        </Callout>
      ) : null}

      <div className="timed-preset-section" role="region" aria-label="Select simulation preset">
        <h3 className="timed-preset-heading">Select simulation preset:</h3>
        <div className="timed-preset-cards" role="radiogroup" aria-label="Preset options">
          <label className={`timed-preset-card ${selectedPreset === "set-1" ? "timed-preset-card--active" : ""}`}>
            <input
              type="radio"
              name="timed-exam-preset"
              value="set-1"
              checked={selectedPreset === "set-1"}
              onChange={() => setSelectedPreset("set-1")}
            />
            <div className="timed-preset-body">
              <div className="timed-preset-head">
                <span className="timed-preset-title">Standard Simulation #1 (Mock Exam Set 1)</span>
                <Badge tone="accent">Set 1</Badge>
              </div>
              <p className="timed-preset-desc">
                Standard form strictly allocated by official 7 Domain CCAO-F weights (14% D1, 21% D2, 12% D3, 16% D4, 12% D5, 15% D6, 10% D7).
              </p>
            </div>
          </label>

          <label className={`timed-preset-card ${selectedPreset === "set-2" ? "timed-preset-card--active" : ""}`}>
            <input
              type="radio"
              name="timed-exam-preset"
              value="set-2"
              checked={selectedPreset === "set-2"}
              onChange={() => setSelectedPreset("set-2")}
            />
            <div className="timed-preset-body">
              <div className="timed-preset-head">
                <span className="timed-preset-title">Alternative Simulation #2 (Mock Exam Set 2)</span>
                <Badge tone="ok">Set 2</Badge>
              </div>
              <p className="timed-preset-desc">
                Second distinct permutation drawing backup items from the 105-question bank for comprehensive coverage.
              </p>
            </div>
          </label>

          <label className={`timed-preset-card ${selectedPreset === "random" ? "timed-preset-card--active" : ""}`}>
            <input
              type="radio"
              name="timed-exam-preset"
              value="random"
              checked={selectedPreset === "random"}
              onChange={() => setSelectedPreset("random")}
            />
            <div className="timed-preset-body">
              <div className="timed-preset-head">
                <span className="timed-preset-title">Randomized Simulation</span>
                <Badge tone="neutral">Dynamic</Badge>
              </div>
              <p className="timed-preset-desc">
                Generates a fresh 60-item combination strictly respecting the 7 Domain blueprint weights for each attempt.
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="assessment-actions">
        <button
          type="button"
          className="button button--primary"
          onClick={() => onStart(selectedPreset)}
          disabled={!canStart}
        >
          <Play size={14} strokeWidth={2} aria-hidden="true" />
          Start timed exam
        </button>
        <span className="assessment-hint">
          {canStart
            ? `${selectedItemCount} of ${requestedItemCount} questions (${selectedPreset === "set-1" ? "Set 1" : selectedPreset === "set-2" ? "Set 2" : "Random"}) selected by published domain weight. The deadline is saved locally.`
            : "Starting is disabled until the reviewed bank can fill the full exam."}
        </span>
      </div>

      <section className="section timed-intro-allocation" aria-labelledby="timed-allocation-title">
        <div className="section-heading-row">
          <h3 className="section-title" id="timed-allocation-title">
            Blueprint allocation
          </h3>
          <span className="section-note">
            {domains.length} official domains · weight-based, availability-capped
          </span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <caption className="sr-only">Timed exam allocation by official domain</caption>
            <thead>
              <tr>
                <th scope="col">Domain</th>
                <th scope="col">Weight</th>
                <th scope="col">Available</th>
                <th scope="col">Selected</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((allocation) => {
                const domain = domainById.get(allocation.domainId);

                return (
                  <tr key={allocation.domainId}>
                    <th scope="row">
                      <span className="data-table-code">{domain?.code ?? "?"}</span>{" "}
                      {domain?.title ?? allocation.domainId}
                    </th>
                    <td>{allocation.weightPercent}%</td>
                    <td>{allocation.available}</td>
                    <td>{allocation.allocated}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
