import { ArrowRight, BookOpen, ListChecks, RotateCcw, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { PageHeader } from "../components/ui/PageHeader";
import {
  allQuestions,
  getAssessment,
  getDomain,
  getLessonForDomain,
  getPracticeSetForDomain,
  plannedLessons,
  practiceSets,
  primaryBlueprint,
  primaryCertification,
  publishedLessons,
  questionBankEntries,
} from "../content";
import { mockExamDefinition, mockExamSummary } from "../content/mock-exam";
import { deriveReviewItems, type StudyAttempt } from "../domain";
import { deriveProgressSummary } from "../features/progress/selectors";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useStudyState } from "../persistence/study-store";
import { useTimedExamState } from "../persistence/timed-exam-store";

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

function domainForObjective(objectiveId: string) {
  return primaryBlueprint.domains.find((domain) =>
    domain.objectives.some((objective) => objective.id === objectiveId),
  );
}

function describeActiveStudyAttempt(attempt: StudyAttempt): {
  title: string;
  to: string;
  answeredCount: number;
  totalCount: number;
} {
  const answeredCount = attempt.questionIds.filter(
    (questionId) => (attempt.session.answers[questionId]?.length ?? 0) > 0,
  ).length;
  const totalCount = attempt.questionIds.length;

  if (attempt.origin.kind === "mock-exam") {
    return {
      title: mockExamDefinition.title,
      to: "/mock-exam",
      answeredCount,
      totalCount,
    };
  }

  const assessment = getAssessment(attempt.origin.practiceSetId);
  return {
    title: assessment?.title ?? attempt.origin.practiceSetId,
    to: `/practice?set=${encodeURIComponent(attempt.origin.practiceSetId)}`,
    answeredCount,
    totalCount,
  };
}

const featuredDomain = featuredLesson.examMapping.objectiveIds
  .map((objectiveId) => domainForObjective(objectiveId))
  .find((domain) => domain !== undefined);

export function DashboardPage() {
  useDocumentTitle();
  const snapshot = useStudyState();
  const timedExamSnapshot = useTimedExamState();
  const timedSession =
    timedExamSnapshot.status === "ready" ? timedExamSnapshot.session : undefined;

  const submittedStudyAttempts = snapshot.state.attempts.filter(
    (attempt) => attempt.session.status === "submitted",
  );
  const activeStudyAttempts = snapshot.state.attempts.filter(
    (attempt) => attempt.session.status === "in-progress",
  );
  const submittedAttempts =
    submittedStudyAttempts.length +
    (timedSession?.session.status === "submitted" ? 1 : 0);
  const activeAttempts =
    activeStudyAttempts.length +
    (timedSession?.session.status === "in-progress" ? 1 : 0);
  const reviewItems = deriveReviewItems(snapshot.state, questionById);
  const progressSummary = deriveProgressSummary(
    snapshot.state,
    questionBankEntries,
    primaryBlueprint,
    questionById,
    timedSession,
  );
  const domainStatsById = new Map(
    progressSummary.personal.domains.map((domainStat) => [domainStat.domainId, domainStat]),
  );
  const timedAnsweredCount =
    timedSession?.session.status === "in-progress"
      ? timedSession.questionIds.filter(
          (questionId) => (timedSession.session.answers[questionId]?.length ?? 0) > 0,
        ).length
      : 0;

  return (
    <div className="page">
      <PageHeader
        eyebrow={`Workspace · ${primaryCertification.code}`}
        title="Your study desk"
        lede="The CCAO-F blueprint is verified for exams before 2026-11-17. Lessons develop deep conceptual reasoning in English, knowledge checks simulate exam questions, and all progress is saved locally in your browser."
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
              {featuredLesson.kind === "sample"
                ? "Sample lesson"
                : featuredDomain
                  ? `Domain ${featuredDomain.code} lesson`
                  : "Curriculum lesson"}
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

      {activeAttempts > 0 || reviewItems.length > 0 ? (
        <section className="section" aria-labelledby="active-study">
          <div className="section-heading-row">
            <h2 className="section-title" id="active-study">
              Continue active study
            </h2>
            <span className="section-note">Saved in this browser</span>
          </div>
          <div className="row-list">
            {activeStudyAttempts.map((attempt) => {
              const info = describeActiveStudyAttempt(attempt);

              return (
                <Link className="row" key={attempt.session.id} to={info.to}>
                  <span className="row-start" aria-hidden="true">
                    <ListChecks size={14} strokeWidth={1.9} />
                  </span>
                  <span className="row-body">
                    <span className="row-title">{info.title}</span>
                    <span className="row-meta">
                      In progress · {info.answeredCount}/{info.totalCount} answered
                    </span>
                  </span>
                  <span className="row-tail">Resume</span>
                </Link>
              );
            })}
            {timedSession?.session.status === "in-progress" ? (
              <Link className="row" to="/mock-exam/timed">
                <span className="row-start" aria-hidden="true">
                  <Timer size={14} strokeWidth={1.9} />
                </span>
                <span className="row-body">
                  <span className="row-title">Timed mock exam</span>
                  <span className="row-meta">
                    In progress · {timedAnsweredCount}/{timedSession.questionIds.length} answered
                  </span>
                </span>
                <span className="row-tail">Resume</span>
              </Link>
            ) : null}
            {reviewItems.length > 0 ? (
              <Link className="row" to="/review">
                <span className="row-start" aria-hidden="true">
                  <RotateCcw size={14} strokeWidth={1.9} />
                </span>
                <span className="row-body">
                  <span className="row-title">Open review queue</span>
                  <span className="row-meta">
                    {reviewItems.length} open {reviewItems.length === 1 ? "item" : "items"} from
                    submitted attempts — review explanations or practice open items
                  </span>
                </span>
                <span className="row-tail">Review</span>
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

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
          {primaryBlueprint.domains.map((domain) => {
            const mappedLesson = getLessonForDomain(domain.id);
            const domainPracticeSet = getPracticeSetForDomain(domain.id);
            const domainStat = domainStatsById.get(domain.id);

            return (
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
                    {domainStat ? ` · ${domainStat.bankItemCount} bank items` : ""}
                    {domainStat && domainStat.uniqueAttemptedItems > 0
                      ? ` · ${domainStat.uniqueAttemptedItems}/${domainStat.bankItemCount} seen`
                      : ""}
                    {domainStat && domainStat.latestAccuracy !== undefined
                      ? ` · Latest: ${domainStat.latestAccuracy}%`
                      : ""}
                  </span>
                  {mappedLesson || domainPracticeSet ? (
                    <span className="row-meta">
                      {mappedLesson ? (
                        <Link className="inline-link" to={`/learn/${mappedLesson.id}`}>
                          Lesson: {mappedLesson.title}
                        </Link>
                      ) : null}
                      {mappedLesson && domainPracticeSet ? " · " : null}
                      {domainPracticeSet ? (
                        <Link
                          className="inline-link"
                          to={`/practice?set=${encodeURIComponent(domainPracticeSet.assessment.id)}`}
                        >
                          Practice ({domainPracticeSet.questionCount} items)
                        </Link>
                      ) : null}
                    </span>
                  ) : null}
                </span>
                <span className="row-tail">{domain.weightPercent}%</span>
              </div>
            );
          })}
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
        {plannedLessons.length > 0 ? (
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
        ) : (
          <Callout tone="note" title="No lessons queued">
            All seven exam domains now have a published, exam-mapped lesson. No additional lesson is
            queued; the Context Window sample remains intentionally unmapped.
          </Callout>
        )}
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
          <Link className="row" to="/mock-exam/timed">
            <span className="row-start" aria-hidden="true">
              <Timer size={14} strokeWidth={1.9} />
            </span>
            <span className="row-body">
              <span className="row-title">Timed simulation</span>
              <span className="row-meta">
                {mockExamSummary.requestedItemCount} questions in{" "}
                {primaryBlueprint.format.timeLimitMinutes} minutes — saved deadline, auto-submit,
                raw score only
              </span>
            </span>
            <span className="row-tail">Timed</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
