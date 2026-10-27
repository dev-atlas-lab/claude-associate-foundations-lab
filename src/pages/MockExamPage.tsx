import { Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { PageHeader } from "../components/ui/PageHeader";
import { mockExamDefinition, mockExamQuestions, mockExamSummary } from "../content/mock-exam";
import { primaryBlueprint } from "../content";
import { findActiveAttempt, findLatestSubmittedAttempt } from "../domain";
import { PersistedAssessment } from "../features/study/components/PersistedAssessment";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useStudyState } from "../persistence/study-store";

const domainById = new Map(primaryBlueprint.domains.map((domain) => [domain.id, domain]));

export function MockExamPage() {
  useDocumentTitle("Mock exam");
  const snapshot = useStudyState();
  const activeAttempt = findActiveAttempt(snapshot.state, mockExamDefinition.id);
  const latestSubmitted = findLatestSubmittedAttempt(snapshot.state, mockExamDefinition.id);
  const initialSession = activeAttempt?.session ?? latestSubmitted?.session;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Assessment"
        title="Mock exam"
        lede="A blueprint-weighted preview over the reviewed bank. It follows the verified domain weights as closely as the available items allow, reports the shortfall instead of inventing filler, and produces no official scaled score."
        meta={
          <>
            <Badge tone="ok">Format verified</Badge>
            <Badge tone="warn">
              {mockExamSummary.selectedItemCount}/{mockExamSummary.requestedItemCount} items
            </Badge>
            <Badge>Preview only</Badge>
          </>
        }
      />

      <Callout tone="caution" title="This is a preview, not a 60-item simulation">
        Exam Guide v{primaryBlueprint.version} specifies {mockExamSummary.requestedItemCount} items in{" "}
        {primaryBlueprint.format.timeLimitMinutes} minutes. The reviewed bank currently has{" "}
        {mockExamSummary.selectedItemCount} usable items, so this run selects all of them and reports
        a shortfall of {mockExamSummary.shortfall}. No item is duplicated to reach 60, no timer is
        applied, and no scaled score or readiness claim is made.
      </Callout>

      <section className="section" aria-labelledby="allocation">
        <div className="section-heading-row">
          <h2 className="section-title" id="allocation">
            Blueprint allocation
          </h2>
          <span className="section-note">
            {mockExamSummary.domainsWithItems}/{primaryBlueprint.domains.length} domains have items
          </span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <caption className="sr-only">
              Mock exam preview allocation by official domain
            </caption>
            <thead>
              <tr>
                <th scope="col">Domain</th>
                <th scope="col">Weight</th>
                <th scope="col">Available</th>
                <th scope="col">Selected</th>
              </tr>
            </thead>
            <tbody>
              {mockExamSummary.allocations.map((allocation) => {
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

        <p className="study-note">
          Allocation uses each domain's published weight and caps at the number of reviewed items
          available. A domain with zero available items stays visible with zero selected; it is not
          silently replaced by another domain.
        </p>
      </section>

      <section className="section" aria-labelledby="mock-runner">
        <div className="section-heading-row">
          <h2 className="section-title" id="mock-runner">
            Run the preview
          </h2>
          <span className="section-note">
            {mockExamSummary.selectedItemCount} items · no timer · saved locally
          </span>
        </div>

        <PersistedAssessment
          key={mockExamDefinition.id}
          definition={mockExamDefinition}
          questions={mockExamQuestions}
          origin={{ kind: "mock-exam", blueprintId: primaryBlueprint.id }}
          initialSession={initialSession}
        />

        <p className="study-note">
          <Timer size={13} strokeWidth={1.9} aria-hidden="true" /> A timed 60-item simulation is not
          available until the reviewed bank can fill the format without duplication. Until then, use
          this preview for weighted practice and inspect the per-domain report on{" "}
          <Link className="inline-link" to="/progress">
            Progress
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
