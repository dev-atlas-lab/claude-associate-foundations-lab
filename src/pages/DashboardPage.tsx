import { ArrowRight, BookOpen, ListChecks, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { PageHeader } from "../components/ui/PageHeader";
import {
  allQuestions,
  getDomain,
  plannedLessons,
  practiceSets,
  primaryBlueprint,
  primaryCertification,
  publishedLessons,
  questionBankEntries,
} from "../content";
import { mockExamSummary } from "../content/mock-exam";
import { deriveReviewItems } from "../domain";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useStudyState } from "../persistence/study-store";

const questionById = new Map(allQuestions.map((question) => [question.id, question]));

const featuredLesson =
  publishedLessons.find((lesson) => lesson.kind === "curriculum") ?? publishedLessons[0];
const knowledgeCheckCount = publishedLessons.reduce(
  (total, lesson) => total + lesson.questions.length,
  0,
);
const publishedMappedLessonCount = publishedLessons.filter(
  (lesson) => lesson.examMapping.status !== "unmapped",
).length;
const sampleLessonCount = publishedLessons.filter((lesson) => lesson.kind === "sample").length;

function hasMappedLessonForDomain(domainId: string): boolean {
  const domain = getDomain(domainId);
  const objectiveIds = new Set(domain?.objectives.map((objective) => objective.id) ?? []);

  return publishedLessons.some((lesson) =>
    lesson.examMapping.objectiveIds.some((objectiveId) => objectiveIds.has(objectiveId)),
  );
}

export function DashboardPage() {
  useDocumentTitle();
  const snapshot = useStudyState();
  const submittedAttempts = snapshot.state.attempts.filter(
    (attempt) => attempt.session.status === "submitted",
  ).length;
  const activeAttempts = snapshot.state.attempts.length - submittedAttempts;
  const reviewItems = deriveReviewItems(snapshot.state, questionById);

  return (
    <div className="page">
      <PageHeader
        eyebrow={`Workspace · ${primaryCertification.code}`}
        title="Your study desk"
        lede="The CCAO-F blueprint is verified for exams before 2026-11-17. Lessons explain the thinking in Vietnamese, knowledge checks ask you to decide in English, and nothing here needs an account."
        meta={
          <>
            <Badge tone="ok">Blueprint v{primaryBlueprint.version} verified</Badge>
            <Badge>60 items · 120 min</Badge>
            <Badge>Frontend only</Badge>
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
            <Badge tone="accent">
              {featuredLesson.kind === "sample" ? "Sample lesson" : "Domain 2 lesson"}
            </Badge>
            <Badge>{featuredLesson.estimatedMinutes} min read</Badge>
            <Badge tone={featuredLesson.examMapping.status === "unmapped" ? "warn" : "ok"}>
              {featuredLesson.examMapping.status === "unmapped" ? "Not exam-mapped" : "Exam-mapped"}
            </Badge>
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
          <span className="section-note">Derived from the content registry and local storage</span>
        </div>
        <div className="stat-grid">
          <article className="stat">
            <span className="stat-label">Lessons available</span>
            <span className="stat-value">{publishedLessons.length}</span>
            <span className="stat-hint">
              {publishedMappedLessonCount} exam-mapped curriculum + {sampleLessonCount} design{" "}
              {sampleLessonCount === 1 ? "sample" : "samples"}
            </span>
          </article>
          <article className="stat">
            <span className="stat-label">Reviewed bank items</span>
            <span className="stat-value">{questionBankEntries.length}</span>
            <span className="stat-hint">
              {practiceSets.length} practice sets · {knowledgeCheckCount} lesson knowledge checks
            </span>
          </article>
          <article className="stat">
            <span className="stat-label">Saved attempts</span>
            <span className="stat-value">{submittedAttempts}</span>
            <span className="stat-hint">
              {activeAttempts} in progress · {reviewItems.length} open review items
            </span>
          </article>
        </div>
      </section>

      <section className="section">
        <Callout tone="note" title="Blueprint verified for your exam window">
          {primaryBlueprint.versionNotice}
        </Callout>
      </section>

      <section className="section" aria-labelledby="curriculum-map">
        <div className="section-heading-row">
          <h2 className="section-title" id="curriculum-map">
            Exam blueprint
          </h2>
          <span className="section-note">Official domains and weights · v{primaryBlueprint.version}</span>
        </div>
        <div className="row-list">
          {primaryBlueprint.domains.map((domain) => (
            <div className="row" key={domain.id}>
              <span className="row-start" aria-hidden="true">
                {domain.code.padStart(2, "0")}
              </span>
              <span className="row-body">
                <span className="row-title">{domain.title}</span>
                <span className="row-meta">
                  {domain.objectives.length} objectives ·{" "}
                  {hasMappedLessonForDomain(domain.id)
                    ? "reviewed lesson available"
                    : "lesson mapping not started"}
                </span>
              </span>
              <span className="row-tail">{domain.weightPercent}%</span>
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
          {plannedLessons.map((lesson) => {
            const domain = lesson.domainId ? getDomain(lesson.domainId) : undefined;

            return (
              <div className="row" key={lesson.id}>
                <span className="row-start" aria-hidden="true">
                  <BookOpen size={14} strokeWidth={1.9} />
                </span>
                <span className="row-body">
                  <span className="row-title">{lesson.title}</span>
                  <span className="row-meta">
                    {domain ? `Domain ${domain.code} · ${domain.title}` : lesson.note}
                  </span>
                </span>
                <span className="row-tail">Planned</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section" aria-labelledby="assessment-shortcuts">
        <div className="section-heading-row">
          <h2 className="section-title" id="assessment-shortcuts">
            Assessment
          </h2>
          <span className="section-note">
            {questionBankEntries.length} reviewed items · {practiceSets.length} practice sets
          </span>
        </div>
        <div className="row-list">
          <Link className="row" to="/practice">
            <span className="row-start" aria-hidden="true">
              <ListChecks size={14} strokeWidth={1.9} />
            </span>
            <span className="row-body">
              <span className="row-title">Practice questions</span>
              <span className="row-meta">
                Choose a domain or mixed set — {questionBankEntries.length} reviewed questions,
                saved locally
              </span>
            </span>
            <span className="row-tail">Open</span>
          </Link>
          <Link className="row" to="/mock-exam">
            <span className="row-start" aria-hidden="true">
              <Timer size={14} strokeWidth={1.9} />
            </span>
            <span className="row-body">
              <span className="row-title">Mock exam</span>
              <span className="row-meta">
                Blueprint-weighted preview — {mockExamSummary.selectedItemCount} of{" "}
                {mockExamSummary.requestedItemCount} items, no timer, no scaled score
              </span>
            </span>
            <span className="row-tail">Preview</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
