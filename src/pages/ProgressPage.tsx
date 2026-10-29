import { ChartNoAxesColumnIncreasing, ListChecks, Printer, Target } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { allQuestions, primaryBlueprint, questionBankEntries } from "../content";
import {
  deriveProgressSummary,
  type AttemptHistorySource,
} from "../features/progress/selectors";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useStudyState } from "../persistence/study-store";
import { useTimedExamState } from "../persistence/timed-exam-store";

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

function formatAttemptSourceLabel(source: AttemptHistorySource): string {
  if (source === "practice") {
    return "Practice";
  }

  if (source === "timed-mock-exam") {
    return "Timed simulation";
  }

  return "Untimed preview";
}

export function ProgressPage() {
  useDocumentTitle("Progress");
  const snapshot = useStudyState();
  const timedSnapshot = useTimedExamState();
  const summary = deriveProgressSummary(
    snapshot.state,
    questionBankEntries,
    primaryBlueprint,
    questionById,
    timedSnapshot.session,
  );
  const hasAttempts = summary.personal.submittedAttempts > 0;

  const { practicedBlueprintWeight, weightedAccuracy, readinessIndex, priorityRemediations } =
    useMemo(() => {
      let practicedWeight = 0;
      let weightedAccSum = 0;

      for (const d of summary.personal.domains) {
        if (d.attemptedQuestions > 0 && d.latestAccuracy !== undefined) {
          practicedWeight += d.weightPercent;
          weightedAccSum += (d.latestAccuracy * d.weightPercent);
        }
      }

      const weightedAcc =
        practicedWeight > 0 ? Math.round((weightedAccSum / practicedWeight) * 10) / 10 : undefined;

      const readiness =
        practicedWeight > 0 && weightedAcc !== undefined
          ? Math.round(((practicedWeight / 100) * (weightedAcc / 100)) * 100)
          : 0;

      const needReview = summary.personal.objectives.filter(
        (o) => o.signal === "needs-review",
      );
      const partial = summary.personal.objectives.filter(
        (o) => o.signal === "partial-bank-correct",
      );
      const unpracticed = summary.personal.objectives.filter(
        (o) => o.signal === "not-practiced",
      );

      const prioritized = [...needReview, ...partial, ...unpracticed].slice(0, 3);

      return {
        practicedBlueprintWeight: practicedWeight,
        weightedAccuracy: weightedAcc,
        readinessIndex: readiness,
        priorityRemediations: prioritized,
      };
    }, [summary.personal.domains, summary.personal.objectives]);

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
        actions={
          <button
            className="button button--secondary"
            type="button"
            onClick={() => window.print()}
          >
            <Printer size={14} strokeWidth={2} aria-hidden="true" />
            In / Xuất Báo cáo (PDF)
          </button>
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
            <article className="readiness-card" aria-label="Exam Readiness & Blueprint Balance">
              <div className="readiness-header">
                <div className="readiness-title-group">
                  <span className="readiness-icon-wrap" aria-hidden="true">
                    <Target size={22} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="readiness-title">
                      Chỉ số Sẵn sàng Thi & Cân bằng Blueprint (Diagnostic Index)
                    </h3>
                    <span className="readiness-subtitle">
                      Dựa trên phân bổ trọng số kỳ thi chính thức và kết quả lần làm gần nhất trên ngân hàng câu hỏi
                    </span>
                  </div>
                </div>
                <Badge tone={readinessIndex >= 70 ? "ok" : readinessIndex >= 40 ? "accent" : "warn"}>
                  {readinessIndex >= 70 ? "Tốt · Sẵn sàng cao" : readinessIndex >= 40 ? "Đang tiến bộ" : "Cần củng cố thêm"}
                </Badge>
              </div>

              <div className="readiness-metrics-grid">
                <div className="readiness-metric-box">
                  <span className="readiness-metric-label">Blueprint Practiced Coverage</span>
                  <span className="readiness-metric-value">{practicedBlueprintWeight}%</span>
                  <span className="readiness-metric-hint">
                    Tổng trọng số các Domain bạn đã làm ít nhất 1 bài
                  </span>
                </div>

                <div className="readiness-metric-box">
                  <span className="readiness-metric-label">Weighted Latest Accuracy</span>
                  <span className="readiness-metric-value">
                    {weightedAccuracy !== undefined ? `${weightedAccuracy}%` : "—"}
                  </span>
                  <span className="readiness-metric-hint">
                    Độ chính xác trung bình theo trọng số đề thi
                  </span>
                </div>

                <div className="readiness-metric-box">
                  <span className="readiness-metric-label">Overall Readiness Index</span>
                  <span className="readiness-metric-value">{readinessIndex}%</span>
                  <span className="readiness-metric-hint">
                    Tích hợp độ bao phủ Blueprint và tỷ lệ làm đúng
                  </span>
                </div>
              </div>

              {priorityRemediations.length > 0 ? (
                <div className="remediation-section">
                  <div className="section-heading-row">
                    <h4 className="section-subtitle" style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>
                      Mục tiêu ưu tiên cần củng cố (Top Focus Areas)
                    </h4>
                    <span className="section-note">
                      Dựa trên câu làm sai gần đây hoặc chưa luyện tập
                    </span>
                  </div>
                  <div className="remediation-grid">
                    {priorityRemediations.map((obj) => (
                      <div className="remediation-card" key={obj.objectiveId}>
                        <div className="remediation-card-head">
                          <Badge tone={obj.signal === "needs-review" ? "warn" : "neutral"}>
                            Domain {obj.domainCode}
                          </Badge>
                          <span className="section-note" style={{ fontSize: "var(--text-xs)" }}>
                            {obj.signalLabel}
                          </span>
                        </div>
                        <p className="remediation-statement" lang="en">
                          {obj.statement}
                        </p>
                        <div className="remediation-actions">
                          {obj.lessonId && obj.lessonTitle ? (
                            <Link className="inline-link" to={`/learn/${obj.lessonId}`}>
                              Bài học: {obj.lessonTitle}
                            </Link>
                          ) : null}
                          {obj.practiceSetId ? (
                            <Link
                              className="inline-link"
                              to={`/practice?set=${encodeURIComponent(obj.practiceSetId)}`}
                            >
                              Luyện tập Domain {obj.domainCode}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>

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
              <article className="stat">
                <span className="stat-label">Unique bank exposure</span>
                <span className="stat-value">
                  {summary.personal.uniqueItemsAttempted}/{summary.bank.totalItems}
                </span>
                <span className="stat-hint">
                  {summary.personal.uniqueItemsAnswered} answered ·{" "}
                  {summary.personal.objectivesPracticed}/{summary.bank.objectivesTotal} objectives
                  practiced
                </span>
              </article>
              <article className="stat">
                <span className="stat-label">First-seen accuracy</span>
                <span className="stat-value">
                  {summary.personal.firstSeen.status === "available"
                    ? formatPercent(summary.personal.firstSeen.percentage)
                    : "—"}
                </span>
                <span className="stat-hint">
                  {summary.personal.firstSeen.status === "available"
                    ? `${summary.personal.firstSeen.correct}/${summary.personal.firstSeen.answered} correct on first answered encounter`
                    : summary.personal.firstSeen.note}
                </span>
              </article>
              <article className="stat">
                <span className="stat-label">Latest accuracy</span>
                <span className="stat-value">
                  {summary.personal.latest.status === "available"
                    ? formatPercent(summary.personal.latest.percentage)
                    : "—"}
                </span>
                <span className="stat-hint">
                  {summary.personal.latest.status === "available"
                    ? `${summary.personal.latest.correct}/${summary.personal.latest.answered} correct on most recent answered encounter`
                    : summary.personal.latest.note}
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
                    <th scope="col">Unique seen</th>
                    <th scope="col">Latest</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.personal.domains.map((domain) => (
                    <tr key={domain.domainId}>
                      <th scope="row">
                        <span className="data-table-code">{domain.code}</span> {domain.title}
                        {domain.lessonId || domain.practiceSetId ? (
                          <div className="table-remediation">
                            {domain.lessonId && domain.lessonTitle ? (
                              <Link className="inline-link" to={`/learn/${domain.lessonId}`}>
                                Bài học: {domain.lessonTitle}
                              </Link>
                            ) : null}
                            {domain.practiceSetId ? (
                              <Link
                                className="inline-link"
                                to={`/practice?set=${encodeURIComponent(domain.practiceSetId)}`}
                              >
                                Luyện tập Domain {domain.code}
                              </Link>
                            ) : null}
                          </div>
                        ) : null}
                      </th>
                      <td>{domain.attemptedQuestions}</td>
                      <td>{domain.correctAnswers}</td>
                      <td>{domain.incorrectAnswers}</td>
                      <td>{domain.unansweredQuestions}</td>
                      <td>{formatPercent(domain.accuracyOnAnswered)}</td>
                      <td>
                        {domain.uniqueAttemptedItems}/{domain.bankItemCount}
                      </td>
                      <td>
                        {domain.latestOrderUnavailable
                          ? "Unavailable"
                          : formatPercent(domain.latestAccuracy)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Callout tone="note" title="These are practice metrics, not a readiness score">
              Accuracy is calculated from your submitted answers. It is not a scaled exam score, not
              a prediction, and not comparable to the official 100–1,000 scale. A small bank (2–4
              reviewed items per objective) also means the same question can appear in more than one
              attempt; compare first-seen accuracy against latest accuracy so repeated questions do
              not mask unfamiliar concepts.
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

      {hasAttempts ? (
        <section className="section" aria-labelledby="objective-coverage">
          <div className="section-heading-row">
            <h2 className="section-title" id="objective-coverage">
              Objective coverage & performance
            </h2>
            <span className="section-note">
              {summary.personal.objectivesPracticed}/{summary.bank.objectivesTotal} objectives
              practiced · 2–4 reviewed items per objective
            </span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <caption className="sr-only">
                Objective coverage and latest outcomes across all 30 official objectives
              </caption>
              <thead>
                <tr>
                  <th scope="col">Objective</th>
                  <th scope="col">Bank items</th>
                  <th scope="col">Practiced</th>
                  <th scope="col">First-seen correct</th>
                  <th scope="col">Latest correct</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.personal.objectives.map((objective) => (
                  <tr key={objective.objectiveId}>
                    <th scope="row">
                      <span className="data-table-code">D{objective.domainCode}</span>{" "}
                      <span lang="en">{objective.statement}</span>
                      {objective.lessonId || objective.practiceSetId ? (
                        <div className="table-remediation">
                          {objective.lessonId && objective.lessonTitle ? (
                            <Link className="inline-link" to={`/learn/${objective.lessonId}`}>
                              Bài học: {objective.lessonTitle}
                            </Link>
                          ) : null}
                          {objective.practiceSetId ? (
                            <Link
                              className="inline-link"
                              to={`/practice?set=${encodeURIComponent(objective.practiceSetId)}`}
                            >
                              Luyện tập Domain {objective.domainCode}
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                    </th>
                    <td>{objective.bankItemCount}</td>
                    <td>
                      {objective.practicedItemCount}/{objective.bankItemCount}
                    </td>
                    <td>
                      {objective.firstSeenOrderUnavailable
                        ? "Unavailable"
                        : `${objective.firstSeenCorrectCount}/${objective.firstSeenAnsweredCount}`}
                    </td>
                    <td>
                      {objective.latestOrderUnavailable
                        ? "Unavailable"
                        : `${objective.latestCorrectCount}/${objective.bankItemCount}`}
                    </td>
                    <td className="data-table-cell-wrap">{objective.signalLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {hasAttempts ? (
        <section className="section" aria-labelledby="attempt-history">
          <div className="section-heading-row">
            <h2 className="section-title" id="attempt-history">
              Submitted attempt history
            </h2>
            <span className="section-note">
              {summary.personal.attemptHistory.length} submitted{" "}
              {summary.personal.attemptHistory.length === 1 ? "attempt" : "attempts"} (most recent
              first)
            </span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <caption className="sr-only">Chronological submitted attempt history</caption>
              <thead>
                <tr>
                  <th scope="col">Assessment</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Correct / Total</th>
                  <th scope="col">Incorrect</th>
                  <th scope="col">Unanswered</th>
                  <th scope="col">Flagged</th>
                  <th scope="col">Raw %</th>
                </tr>
              </thead>
              <tbody>
                {summary.personal.attemptHistory.map((entry) => (
                  <tr key={`${entry.storageKey}:${entry.attemptId}`}>
                    <th scope="row">
                      {entry.title}
                      <div className="table-remediation">
                        <Badge>{formatAttemptSourceLabel(entry.source)}</Badge>
                        {entry.storageKey === "cfl.timed-exam.v1" ? (
                          <Badge tone="accent">
                            Saved timed exam slot
                            {entry.submissionReason === "time-expired"
                              ? " · Automatic expiry"
                              : " · Manual submission"}
                          </Badge>
                        ) : null}
                      </div>
                    </th>
                    <td>{formatDate(entry.submittedAt)}</td>
                    <td>
                      {entry.correctAnswers}/{entry.totalQuestions}
                    </td>
                    <td>{entry.incorrectAnswers}</td>
                    <td>{entry.unansweredQuestions}</td>
                    <td>{entry.flaggedQuestions}</td>
                    <td>{entry.rawPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

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
