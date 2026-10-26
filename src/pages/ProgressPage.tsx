import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function ProgressPage() {
  useDocumentTitle("Progress");

  return (
    <div className="page">
      <PageHeader
        eyebrow="Insights"
        title="Learning progress"
        lede="Progress will be calculated from answers you actually submit, stored locally in this browser. No account, no sync, no fabricated numbers."
        meta={<Badge tone="warn">Tracking not implemented</Badge>}
      />

      <div className="stat-grid">
        <article className="stat">
          <span className="stat-label">Lessons completed</span>
          <span className="stat-value">—</span>
          <span className="stat-hint">No completion events recorded</span>
        </article>
        <article className="stat">
          <span className="stat-label">Check accuracy</span>
          <span className="stat-value">—</span>
          <span className="stat-hint">Needs a saved attempt history</span>
        </article>
        <article className="stat">
          <span className="stat-label">Study time</span>
          <span className="stat-value">—</span>
          <span className="stat-hint">Timing will be local and opt-in</span>
        </article>
      </div>

      <section className="section">
        <EmptyState
          icon={ChartNoAxesColumnIncreasing}
          title="No activity to chart yet"
          actions={undefined}
        >
          This phase ships the shell, one sample lesson, and an in-memory assessment core. Saved
          attempts and persistence are the next step; once they exist, this page will show
          domain-level coverage, accuracy over time, and lessons that still have no practice attached.
        </EmptyState>
      </section>

      <section className="section">
        <Callout tone="note" title="What “local” means here">
          Progress will live in this browser under a versioned storage key. Clearing site data or
          switching devices will reset it, and nothing is sent to a server.
        </Callout>
      </section>
    </div>
  );
}
