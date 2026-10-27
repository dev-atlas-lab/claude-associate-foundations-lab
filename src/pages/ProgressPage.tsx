import { ChartNoAxesColumnIncreasing, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { allQuestions, primaryBlueprint, questionBankEntries } from "../content";
import { deriveProgressSummary } from "../features/progress/selectors";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useStudyState } from "../persistence/study-store";

const questionById = new Map(allQuestions.map((question) => [question.id, question]));

function formatPercent(value: number | undefined): string {
  return value === undefined ? "—" : `${value}%`;
}

function formatDate(value: string | undefined): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ProgressPage() {
  useDocumentTitle("Progress");
  const snapshot = useStudyState();
  const summary = deriveProgressSummary(
    snapshot.state,
    questionBankEntries,
    primaryBlueprint,
    questionById,
  );
  const hasAttempts = summary.personal.submittedAttempts > 0;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Insights"
        title="Learning progress"
        lede="Two different questions, kept apart: how much of the reviewed bank exists, and how you have actually performed on submitted attempts. Both are derived from local data, never from invented activity."
        meta={
          <>
            <Badge tone="ok">{summary.bank.totalItems} reviewed items</Badge>
            <Badge tone={hasAttempts ? "accent" : "warn"}>
              {hasAttempts ? `${summary.personal.submittedAttempts} submitted` : "No attempts yet"}
            </Badge>
          </>
        }
      />

      <section className="section" aria-labelledby="bank-coverage">
        <div className="section-heading-row">
          <h2 className="section-title" id="bank-coverage">
            Bank coverage
          </h2>
          <span className="section-note">Content inventory, independent of your activity</span>
        </div>

        <div className="stat-grid">
          <article className="stat">
            <span className="stat-label">Reviewed items</span>
            <span className="stat-value">{summary.bank.totalItems}</span>
            <span className="stat-hint">
              {summary.bank.singleChoiceItems} single-choice ·{" "}
              {summary.bank.multipleResponseItems} multiple-response
            </span>
          </article>
          <article className="stat">
            <span className="stat-label">Objectives covered</span>
            <span className="stat-value">
              {summary.bank.objectivesCovered}/{summary.bank.objectivesTotal}
            </span>
            <span className="stat-hint">
              {summary.bank.objectivesTotal - summary.bank.objectivesCovered === 0
                ? "Every official objective has at least one reviewed item"
                : `${summary.bank.objectivesTotal - summary.bank.objectivesCovered} objectives still have no reviewed item`}
            </span>
          </article>
          <article className="stat">
            <span className="stat-label">Domains with items</span>
            <span className="stat-value">
              {summary.bank.domainsWithItems}/{summary.bank.domains.length}
            </span>
            <span className="stat-hint">
              {summary.bank.domainsWithItems === summary.bank.domains.length
                ? "All official domains have reviewed items"
                : "A domain with zero items is shown, not hidden"}
            </span>
          </article>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <caption className="sr-only">Reviewed bank coverage by official domain</caption>
            <thead>
              <tr>
                <th scope="col">Domain</th>
                <th scope="col">Weight</th>
                <th scope="col">Items</th>
                <th scope="col">Objectives covered</th>
              </tr>
            </thead>
            <tbody>
              {summary.bank.domains.map((domain) => (
                <tr key={domain.domainId}>
                  <th scope="row">
                    <span className="data-table-code">{domain.code}</span> {domain.title}
                  </th>
                  <td>{domain.weightPercent}%</td>
                  <td>{domain.itemCount}</td>
                  <td>
                    {domain.objectivesCovered}/{domain.objectivesTotal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="personal-performance">
        <div className="section-heading-row">
          <h2 className="section-title" id="personal-performance">
            Your performance
          </h2>
          <span className="section-note">
            {hasAttempts
              ? `Last submitted ${formatDate(summary.personal.lastSubmittedAt)}`
              : "Derived from submitted attempts only"}
          </span>
        </div>

        {hasAttempts ? (
          <>
            <div className="stat-grid">
              <article className="stat">
                <span className="stat-label">Submitted attempts</span>
                <span className="stat-value">{summary.personal.submittedAttempts}</span>
                <span className="stat-hint">
                  {summary.personal.answeredQuestions} answered ·{" "}
                  {summary.personal.unansweredQuestions} unanswered
                </span>
              </article>
              <article className="stat">
                <span className="stat-label">Correct answers</span>
                <span className="stat-value">{summary.personal.correctAnswers}</span>
                <span className="stat-hint">
                  {summary.personal.incorrectAnswers} incorrect · all-or-nothing scoring
                </span>
              </article>
              <article className="stat">
                <span className="stat-label">Accuracy on answered</span>
                <span className="stat-value">
                  {formatPercent(summary.personal.accuracyOnAnswered)}
                </span>
                <span className="stat-hint">
                  Raw percentage over all attempted items:{" "}
                  {formatPercent(summary.personal.rawPercentage)}
                </span>
              </article>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <caption className="sr-only">
                  Personal accuracy by official domain
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Domain</th>
                    <th scope="col">Attempted</th>
                    <th scope="col">Correct</th>
                    <th scope="col">Incorrect</th>
                    <th scope="col">Unanswered</th>
                    <th scope="col">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.personal.domains.map((domain) => (
                    <tr key={domain.domainId}>
                      <th scope="row">
                        <span className="data-table-code">{domain.code}</span> {domain.title}
                      </th>
                      <td>{domain.attemptedQuestions}</td>
                      <td>{domain.correctAnswers}</td>
                      <td>{domain.incorrectAnswers}</td>
                      <td>{domain.unansweredQuestions}</td>
                      <td>{formatPercent(domain.accuracyOnAnswered)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Callout tone="note" title="These are practice metrics, not a readiness score">
              Accuracy is calculated from your submitted answers. It is not a scaled exam score, not
              a prediction, and not comparable to the official 100–1,000 scale. A small bank also
              means the same question can appear in more than one attempt.
            </Callout>
          </>
        ) : (
          <EmptyState
            icon={ChartNoAxesColumnIncreasing}
            title="No submitted attempts yet"
            actions={
              <Link className="button button--secondary" to="/practice">
                Start a practice set
              </Link>
            }
          >
            Bank coverage above is real content inventory. Personal performance stays empty until
            you submit an attempt, because a zero would look like a failed attempt rather than no
            activity.
          </EmptyState>
        )}
      </section>

      <section className="section" aria-labelledby="review-status">
        <div className="section-heading-row">
          <h2 className="section-title" id="review-status">
            Review status
          </h2>
          <Link className="inline-link" to="/review">
            Open review queue
          </Link>
        </div>
        <div className="stat-grid">
          <article className="stat">
            <span className="stat-label">Open review items</span>
            <span className="stat-value">{summary.review.unresolved}</span>
            <span className="stat-hint">Incorrect, unanswered, or flagged in submitted attempts</span>
          </article>
          <article className="stat">
            <span className="stat-label">Resolved</span>
            <span className="stat-value">{summary.review.resolved}</span>
            <span className="stat-hint">Explicitly marked reviewed</span>
          </article>
          <article className="stat">
            <span className="stat-label">Next action</span>
            <span className="stat-value">
              <Link className="inline-link" to="/practice">
                Practice
              </Link>
            </span>
            <span className="stat-hint">
              <ListChecks size={13} strokeWidth={1.9} aria-hidden="true" /> Reviewed sets across
              available domains
            </span>
          </article>
        </div>
      </section>
    </div>
  );
}
