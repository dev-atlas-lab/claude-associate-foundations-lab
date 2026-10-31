import { ArrowLeft, BookOpen } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import {
  getBlueprint,
  getCertification,
  getLesson,
  getLessonNeighbours,
  getObjective,
  getPracticeSetForDomain,
  getQuestion,
  getQuestionBankEntry,
  getSources,
} from "../content";
import { LessonContent } from "../features/curriculum/components/LessonContent";
import { LessonPager } from "../features/curriculum/components/LessonPager";
import { LessonToc } from "../features/curriculum/components/LessonToc";
import { lessonOutline } from "../features/curriculum/outline";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function LessonPage() {
  const { lessonId } = useParams();
  const lesson = getLesson(lessonId);

  useDocumentTitle(lesson ? lesson.title : "Lesson not found");

  if (!lesson) {
    return (
      <div className="page page--narrow">
        <PageHeader
          eyebrow="Lesson"
          title="Lesson not found"
          lede={
            lessonId
              ? `No published lesson matches “${lessonId}”. Planned lessons become routable only after they are written and reviewed.`
              : "This route needs a lesson id."
          }
        />
        <EmptyState
          icon={BookOpen}
          title="Nothing to read at this address"
          actions={
            <>
              <Link className="button button--primary" to="/learn">
                Back to modules
              </Link>
              <Link className="button button--secondary" to="/">
                Dashboard
              </Link>
            </>
          }
        >
          Published lessons are listed on the learning modules page. Nothing is hidden behind this
          error.
        </EmptyState>
      </div>
    );
  }

  const neighbours = getLessonNeighbours(lesson.id);
  const sources = getSources(lesson.sourceIds);
  const relatedPractice = lesson.relatedQuestionIds.flatMap((questionId) => {
    const question = getQuestion(questionId);
    const entry = getQuestionBankEntry(questionId);
    const objectiveId = entry?.examMapping.objectiveIds[0];
    const objective = objectiveId ? getObjective(objectiveId) : undefined;

    return question && entry
      ? [{ id: question.id, type: question.type, objectiveStatement: objective?.objective.statement }]
      : [];
  });
  const certification = getCertification(lesson.certificationId);
  const blueprint = getBlueprint(lesson.blueprintId);
  const certificationCode = certification?.code ?? "Certification";
  const blueprintVersion = blueprint?.version ?? "—";
  const practiceDomainIds = [
    ...new Set(
      lesson.examMapping.objectiveIds.flatMap((objectiveId) => {
        const domainId = getObjective(objectiveId)?.domain.id;
        return domainId ? [domainId] : [];
      }),
    ),
  ];
  const practiceDomainCodes = [
    ...new Set(
      lesson.examMapping.objectiveIds.flatMap((objectiveId) => {
        const code = getObjective(objectiveId)?.domain.code;
        return code ? [code] : [];
      }),
    ),
  ];
  const practiceDomainLabel =
    practiceDomainCodes.length > 0 ? `Domain ${practiceDomainCodes.join(", ")}` : "reviewed";
  const practiceSetId =
    practiceDomainIds.length === 1
      ? getPracticeSetForDomain(practiceDomainIds[0]!)?.assessment.id
      : undefined;
  const isMapped = lesson.examMapping.status !== "unmapped";
  const mappingTitle =
    lesson.examMapping.status === "verified"
      ? "Mapped to verified exam objective"
      : lesson.examMapping.status === "candidate"
        ? "Proposed objective, not yet verified"
        : "Not mapped to an official objective";

  return (
    <div className="page">
      <div className="lesson-layout">
        <article className="lesson-body" aria-labelledby="lesson-page-title">
          <header className="lesson-header">
            <div className="meta-row">
              <Badge tone="accent">
                {lesson.kind === "sample" ? "Sample lesson" : `${certificationCode} lesson`}
              </Badge>
              <Badge>{lesson.level}</Badge>
              <Badge>{lesson.estimatedMinutes} min</Badge>
              <Badge tone={isMapped ? "ok" : "warn"}>
                {isMapped ? "Exam-mapped" : "No official objective"}
              </Badge>
            </div>
            <h1 className="lesson-title" id="lesson-page-title">
              {lesson.title}
            </h1>
            <p className="lesson-subtitle" lang="en">
              {lesson.englishTitle}
            </p>
            <p className="lesson-summary">{lesson.summary}</p>
            <div className="lesson-meta">
              <Link className="inline-link" to="/learn">
                <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" /> All modules
              </Link>
              <span className="lesson-meta-divider" aria-hidden="true">
                ·
              </span>
              <span className="mono">
                {certificationCode} · Blueprint v{blueprintVersion}
              </span>
            </div>
          </header>

          <div className="stack">
            <Callout tone={isMapped ? "note" : "unverified"} title={mappingTitle}>
              {lesson.examMapping.note} {lesson.verification.note}
            </Callout>

            <LessonContent
              lesson={lesson}
              sources={sources}
              relatedPractice={relatedPractice}
              practiceDomainLabel={practiceDomainLabel}
              practiceSetId={practiceSetId}
            />

            <LessonPager
              previous={neighbours.previous}
              next={neighbours.next}
              plannedNext={neighbours.plannedNext}
            />
          </div>
        </article>

        <LessonToc items={lessonOutline(lesson)} />
      </div>
    </div>
  );
}
