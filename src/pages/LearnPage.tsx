import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { PageHeader } from "../components/ui/PageHeader";
import { plannedLessons, publishedLessons } from "../content";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function LearnPage() {
  useDocumentTitle("Learn");

  return (
    <div className="page">
      <PageHeader
        eyebrow="Learn"
        title="Learning modules"
        lede="Vietnamese explanations with English terminology kept intact. Only reviewed technical content appears here; the current lesson is a design sample and is not yet mapped to an official CCAO-F objective."
        meta={
          <>
            <Badge tone="ok">Blueprint v1.0 verified</Badge>
            <Badge tone="warn">Sample only</Badge>
          </>
        }
      />

      <Callout tone="note" title="How these lessons are built">
        Every lesson follows the same shape: objectives, a Vietnamese explanation, a visual model,
        a worked scenario, and English knowledge checks with explanations for every option. A
        lesson is only published after its claims are checked against primary sources. Exam mapping
        is a separate status shown on each lesson.
      </Callout>

      <section className="section" aria-labelledby="available-lessons">
        <div className="section-heading-row">
          <h2 className="section-title" id="available-lessons">
            Available now
          </h2>
          <span className="section-note">{publishedLessons.length} published</span>
        </div>
        <div className="row-list">
          {publishedLessons.map((lesson) => (
            <Link className="row" key={lesson.id} to={`/learn/${lesson.id}`}>
              <span className="row-start" aria-hidden="true">
                <BookOpen size={14} strokeWidth={1.9} />
              </span>
              <span className="row-body">
                <span className="row-title">{lesson.title}</span>
                <span className="row-meta">
                  <Clock3 size={11} strokeWidth={2} aria-hidden="true" />
                  {lesson.estimatedMinutes} min · {lesson.level} ·{" "}
                  {lesson.kind === "sample" ? "sample content" : "curriculum"}
                  {lesson.examMapping.status === "unmapped" ? " · no official objective" : ""}
                </span>
              </span>
              <ArrowRight size={15} strokeWidth={1.9} aria-hidden="true" className="row-tail" />
            </Link>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="planned-lessons">
        <div className="section-heading-row">
          <h2 className="section-title" id="planned-lessons">
            Planned
          </h2>
          <span className="section-note">Not routable until written and reviewed</span>
        </div>
        <div className="row-list">
          {plannedLessons.map((lesson) => (
            <div className="row" key={lesson.id}>
              <span className="row-start" aria-hidden="true">
                ·
              </span>
              <span className="row-body">
                <span className="row-title">{lesson.title}</span>
                <span className="row-meta">{lesson.note}</span>
              </span>
              <span className="row-tail">Planned</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
