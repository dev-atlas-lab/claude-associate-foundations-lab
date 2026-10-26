import { Compass } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function NotFoundPage() {
  useDocumentTitle("Page not found");

  const { pathname } = useLocation();

  return (
    <div className="page page--narrow">
      <PageHeader
        eyebrow="404 · Not found"
        title="This page does not exist"
        lede={`Nothing is mapped to “${pathname}”. The route may be planned, renamed, or mistyped.`}
      />
      <EmptyState
        icon={Compass}
        title="Lost in the lab"
        actions={
          <>
            <Link className="button button--primary" to="/">
              Back to dashboard
            </Link>
            <Link className="button button--secondary" to="/learn">
              Browse lessons
            </Link>
          </>
        }
      >
        The navigation stays available, so you can jump straight to lessons, the glossary, or
        settings without retyping the address.
      </EmptyState>
    </div>
  );
}
