import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Lesson, PlannedLesson } from "../types";

export function LessonPager({
  previous,
  next,
  plannedNext,
}: {
  previous?: Lesson;
  next?: Lesson;
  plannedNext?: PlannedLesson;
}) {
  return (
    <nav className="lesson-pager" aria-label="Lesson navigation">
      {previous ? (
        <Link className="pager-card" to={`/learn/${previous.id}`}>
          <span className="pager-label">
            <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" />
            Previous lesson
          </span>
          <span className="pager-title">{previous.title}</span>
        </Link>
      ) : (
        <div className="pager-card" data-disabled="true">
          <span className="pager-label">
            <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" />
            Previous lesson
          </span>
          <span className="pager-title">This is the first lesson</span>
        </div>
      )}

      {next ? (
        <Link className="pager-card pager-card--next" to={`/learn/${next.id}`}>
          <span className="pager-label">
            Next lesson
            <ArrowRight size={12} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="pager-title">{next.title}</span>
        </Link>
      ) : (
        <div className="pager-card pager-card--next" data-disabled="true">
          <span className="pager-label">
            Next lesson
            <ArrowRight size={12} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="pager-title">
            {plannedNext ? `Planned: ${plannedNext.title}` : "End of module"}
          </span>
        </div>
      )}
    </nav>
  );
}
