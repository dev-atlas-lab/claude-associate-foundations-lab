import { Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const plannedSteps = [
  "Read the exam rules: question count, time limit, and scoring rules once they are verified.",
  "Answer the full set without seeing correctness until submission.",
  "Submit to a score with a per-domain breakdown.",
  "Review every item, including why each distractor is wrong.",
];

export function MockExamPage() {
  useDocumentTitle("Mock exam");

  return (
    <div className="page">
      <PageHeader
        eyebrow="Assessment"
        title="Mock exam"
        lede="A timed simulation of the real exam, with results you can inspect afterwards. No timer runs until the official format is confirmed."
        meta={<Badge tone="warn">Format unverified</Badge>}
      />

      <Callout tone="unverified" title="No invented exam facts">
        Exam duration, number of questions, question types, and the passing score are still
        unverified. This page will not display a countdown or a score model until the current
        official guide is reviewed and recorded in the exam blueprint.
      </Callout>

      <section className="section" aria-labelledby="mock-flow">
        <div className="section-heading-row">
          <h2 className="section-title" id="mock-flow">
            Planned flow
          </h2>
          <span className="section-note">Same rules as the real assessment, once known</span>
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
          A timed exam without a verified format would teach the wrong habits. When the guide is
          confirmed, the exam will use the real proportions and show a per-domain result breakdown.
        </EmptyState>
      </section>
    </div>
  );
}
