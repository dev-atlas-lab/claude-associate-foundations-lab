import { ArrowRight, BookOpen, ListChecks, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { PageHeader } from "../components/ui/PageHeader";
import { publishedLessons, plannedLessons } from "../features/curriculum/curriculum";
import { curriculumDisclaimer, provisionalDomains } from "../features/curriculum/domains";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const featuredLesson = publishedLessons[0];

export function DashboardPage() {
  useDocumentTitle();

  return (
    <div className="page">
      <PageHeader
        eyebrow="Workspace"
        title="Your study desk"
        lede="Lessons explain the thinking in Vietnamese, knowledge checks ask you to decide in English, and nothing here needs an account. Start with the sample lesson and see how the format feels."
        meta={
          <>
            <Badge tone="warn">Curriculum unverified</Badge>
            <Badge>Frontend only</Badge>
            <Badge>Local by design</Badge>
          </>
        }
      />

      <section className="feature" aria-labelledby="featured-lesson-title">
        <div className="feature-copy">
          <p className="eyebrow">Start here</p>
          <h2 className="feature-title" id="featured-lesson-title">
            {featuredLesson.title}
          </h2>
          <p className="feature-text">{featuredLesson.summary}</p>
          <div className="feature-meta">
            <Badge tone="accent">Sample lesson</Badge>
            <Badge>{featuredLesson.estimatedMinutes} min read</Badge>
            <Badge>Foundation</Badge>
          </div>
        </div>
        <Link className="button button--primary" to={`/learn/${featuredLesson.id}`}>
          Open lesson
          <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
        </Link>
      </section>

      <section className="section" aria-labelledby="workspace-status">
        <div className="section-heading-row">
          <h2 className="section-title" id="workspace-status">
            Workspace status
          </h2>
          <span className="section-note">Nothing is tracked until the progress store ships</span>
        </div>
        <div className="stat-grid">
          <article className="stat">
            <span className="stat-label">Lessons available</span>
            <span className="stat-value">{publishedLessons.length}</span>
            <span className="stat-hint">One sample lesson, mapped to no official objective</span>
          </article>
          <article className="stat">
            <span className="stat-label">Knowledge checks</span>
            <span className="stat-value">1</span>
            <span className="stat-hint">English question with Vietnamese explanations</span>
          </article>
          <article className="stat">
            <span className="stat-label">Saved progress</span>
            <span className="stat-value">—</span>
            <span className="stat-hint">Local tracking is not implemented yet</span>
          </article>
        </div>
      </section>

      <section className="section">
        <Callout tone="unverified" title="Exam blueprint still unverified">
          {curriculumDisclaimer} The four domain titles below come from the starter scaffold and are
          kept only as layout placeholders.
        </Callout>
      </section>

      <section className="section" aria-labelledby="curriculum-map">
        <div className="section-heading-row">
          <h2 className="section-title" id="curriculum-map">
            Provisional domain map
          </h2>
          <span className="section-note">Weights and objectives pending</span>
        </div>
        <div className="row-list">
          {provisionalDomains.map((domain) => (
            <div className="row" key={domain.id}>
              <span className="row-start" aria-hidden="true">
                {domain.number}
              </span>
              <span className="row-body">
                <span className="row-title">{domain.title}</span>
                <span className="row-meta">Lesson mapping not started</span>
              </span>
              <Badge tone="warn">Unverified</Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="roadmap">
        <div className="section-heading-row">
          <h2 className="section-title" id="roadmap">
            Next up
          </h2>
          <Link className="inline-link" to="/learn">
            Open learning modules
          </Link>
        </div>
        <div className="row-list">
          {plannedLessons.map((lesson) => (
            <div className="row" key={lesson.id}>
              <span className="row-start" aria-hidden="true">
                <BookOpen size={14} strokeWidth={1.9} />
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

      <section className="section" aria-labelledby="assessment-shortcuts">
        <div className="section-heading-row">
          <h2 className="section-title" id="assessment-shortcuts">
            Assessment
          </h2>
          <span className="section-note">Pages exist as honest placeholders</span>
        </div>
        <div className="row-list">
          <Link className="row" to="/practice">
            <span className="row-start" aria-hidden="true">
              <ListChecks size={14} strokeWidth={1.9} />
            </span>
            <span className="row-body">
              <span className="row-title">Practice questions</span>
              <span className="row-meta">Engine not built — read what it will contain</span>
            </span>
            <span className="row-tail">Preview</span>
          </Link>
          <Link className="row" to="/mock-exam">
            <span className="row-start" aria-hidden="true">
              <Timer size={14} strokeWidth={1.9} />
            </span>
            <span className="row-body">
              <span className="row-title">Mock exam</span>
              <span className="row-meta">Format unverified — no timed run available yet</span>
            </span>
            <span className="row-tail">Preview</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
