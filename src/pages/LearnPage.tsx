import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { PageHeader } from "../components/ui/PageHeader";
import { getObjective, plannedLessons, publishedLessons } from "../content";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function LearnPage() {
  useDocumentTitle("Learn");
  const mappedLessonCount = publishedLessons.filter(
    (lesson) => lesson.examMapping.status === "verified",
  ).length;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Learn"
        title="Learning modules"
        lede="Curriculum lessons mapped directly to CCAO-F exam objectives. Built with clear technical explanations in English, interactive visual models, and exam-style knowledge checks."
        meta={
          <>
            <Badge tone="ok">Blueprint v1.0 verified</Badge>
            <Badge tone="ok">{mappedLessonCount} mapped lessons</Badge>
            <Badge tone="warn">1 sample</Badge>
          </>
        }
      />

      <Callout tone="note" title="How these lessons are built">
        Every lesson follows the same core shape: objectives, an in-depth technical explanation, a worked
        scenario, English knowledge checks, and explanations for every option. Visual models appear
        where they improve understanding. A lesson is only published after its claims are checked
        against primary sources. Exam mapping is a separate status shown on each lesson.
      </Callout>

      <section className="section" aria-labelledby="available-lessons">
        <div className="section-heading-row">
          <h2 className="section-title" id="available-lessons">
            Available now
          </h2>
          <span className="section-note">{publishedLessons.length} published</span>
        </div>
        <div className="row-list">
          {publishedLessons.map((lesson) => {
            const domain =
              lesson.examMapping.objectiveIds.length > 0
                ? getObjective(lesson.examMapping.objectiveIds[0]!)?.domain
                : undefined;

            return (
              <Link className="row" key={lesson.id} to={`/learn/${lesson.id}`}>
                <span className="row-start" aria-hidden="true">
                  {domain ? domain.code.padStart(2, "0") : <BookOpen size={14} strokeWidth={1.9} />}
                </span>
                <span className="row-body">
                  <span className="row-title">{lesson.title}</span>
                  <span className="row-meta">
                    <Clock3 size={11} strokeWidth={2} aria-hidden="true" />
                    {lesson.estimatedMinutes} min · {lesson.level} ·{" "}
                    {lesson.kind === "sample"
                      ? "sample content · unmapped"
                      : domain
                        ? `Domain ${domain.code} (${domain.weightPercent}%) · ${lesson.examMapping.objectiveIds.length} objectives`
                        : "curriculum"}
                    {lesson.relatedQuestionIds.length > 0
                      ? ` · ${lesson.relatedQuestionIds.length} practice questions`
                      : ""}
                  </span>
                </span>
                <ArrowRight size={15} strokeWidth={1.9} aria-hidden="true" className="row-tail" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" aria-labelledby="planned-lessons">
        <div className="section-heading-row">
          <h2 className="section-title" id="planned-lessons">
            Planned
          </h2>
          <span className="section-note">Not routable until written and reviewed</span>
        </div>
        {plannedLessons.length > 0 ? (
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
        ) : (
          <Callout tone="note" title="No lessons queued">
            All seven exam domains have a published, exam-mapped curriculum lesson. The Context
            Window sample remains deliberately unmapped.
          </Callout>
        )}
      </section>
    </div>
  );
}
