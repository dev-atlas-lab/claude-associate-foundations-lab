import { BookmarkCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function ReviewPage() {
  useDocumentTitle("Review");

  return (
    <div className="page">
      <PageHeader
        eyebrow="Assessment"
        title="Review mistakes"
        lede="A queue for questions you answered incorrectly or flagged for a second look. It stays empty until practice and mock exams can record answers."
        meta={<Badge tone="warn">No saved attempts</Badge>}
      />

      <EmptyState
        icon={BookmarkCheck}
        title="Nothing to review yet"
        actions={
          <>
            <Link className="button button--secondary" to="/practice">
              Practice overview
            </Link>
            <Link className="button button--ghost" to="/learn">
              Read a lesson
            </Link>
          </>
        }
      >
        Review needs saved answers, and saving is not implemented in this phase. Once it is, this
        page will collect wrong answers and flagged questions, show why each distractor fails, and
        let you retry a question without losing the original attempt.
      </EmptyState>

      <section className="section">
        <Callout tone="note" title="Why this is empty rather than mocked">
          Showing invented review items would suggest the app already tracked your learning. The
          shell only renders real state: zero saved attempts means zero review items.
        </Callout>
      </section>
    </div>
  );
}
