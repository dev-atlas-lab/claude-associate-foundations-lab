import { Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { primaryBlueprint } from "../content";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const plannedSteps = [
  "Follow the verified format: 60 items, 120 minutes, mixed multiple-choice and multiple-response.",
  "Answer the full set without seeing correctness until submission.",
  "Use the implemented assessment core for exact-set scoring; per-domain reporting still needs reviewed question metadata.",
  "Review every item, including why each distractor is wrong.",
];

export function MockExamPage() {
  useDocumentTitle("Mock exam");

  return (
    <div className="page">
      <PageHeader
        eyebrow="Assessment"
        title="Mock exam"
        lede="A timed simulation of the real exam, with results you can inspect afterwards. The official format is verified; the timer, 60-item bank, and per-domain report are not built yet."
        meta={<Badge tone="ok">Format verified</Badge>}
      />

      <Callout tone="note" title="Verified exam format">
        Exam Guide v{primaryBlueprint.version} specifies {primaryBlueprint.format.itemCount} items in{" "}
        {primaryBlueprint.format.timeLimitMinutes} minutes, using multiple-choice and
        multiple-response items. The passing score is {primaryBlueprint.format.passingScore?.cutScore}{" "}
        on a {primaryBlueprint.format.passingScore?.scaledMin}–
        {primaryBlueprint.format.passingScore?.scaledMax} scale. No full practice exam is available
        from Anthropic; the guide publishes three sample items for format calibration only.
      </Callout>

      <section className="section" aria-labelledby="mock-flow">
        <div className="section-heading-row">
          <h2 className="section-title" id="mock-flow">
            Planned flow
          </h2>
          <span className="section-note">Format verified · timer and bank not built</span>
        </div>
        <ol className="row-list">
          {plannedSteps.map((step, index) => (
            <li className="row" key={step}>
              <span className="row-start" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="row-body">
                <span className="row-title">{step}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <EmptyState
          icon={Timer}
          title="No mock exam available yet"
          actions={
            <Link className="button button--secondary" to="/review">
              See how review will work
            </Link>
          }
        >
          The assessment core and exact-set scoring are implemented, but there is no 60-item mock
          question bank, timer, or per-domain report yet. When they ship, this page will run the
          verified format and show a per-domain result breakdown. It will not invent per-domain item
          counts, because the guide publishes weights rather than exact item quotas.
        </EmptyState>
      </section>
    </div>
  );
}
