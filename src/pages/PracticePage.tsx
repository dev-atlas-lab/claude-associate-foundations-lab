import { ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { assessments, getAssessmentQuestions } from "../content";
import { AssessmentRunner } from "../features/assessment/components/AssessmentRunner";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const plannedModes = [
  {
    title: "More domain sets",
    note: "Reviewed sets for the remaining domains, built on the same bank schema and objective validation.",
  },
  {
    title: "Mixed sets",
    note: "Questions sampled across reviewed objectives so you have to choose the right approach, not just recall a definition.",
  },
  {
    title: "Saved review queue",
    note: "Flagging works inside an attempt today. A queue that survives refreshes arrives with local persistence.",
  },
];

export function PracticePage() {
  useDocumentTitle("Practice");
  const practiceAssessment = assessments.find(
    (assessment) => assessment.id === "domain-2-output-validation-set",
  );
  const practiceQuestions = practiceAssessment
    ? getAssessmentQuestions(practiceAssessment)
    : [];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Practice"
        title="Practice questions"
        lede="Fourteen reviewed, original practice items mapped to all six Domain 2 objectives. Questions are in English, explanations are in Vietnamese, and multiple-response items require the exact set. This is a bank preview, not a full practice mode or mock exam."
        meta={
          <>
            <Badge tone="ok">Domain 2 · 21%</Badge>
            <Badge tone="ok">Reviewed bank</Badge>
            <Badge tone="warn">Not official</Badge>
          </>
        }
      />

      <Callout tone="note" title="What this set covers">
        Accuracy and completeness, hallucination/inconsistency and bias detection, source-based
        fact-checking, human-review escalation, audience editing, and output-format selection. The
        matching <Link to="/learn/evaluation-basics">Domain 2 lesson</Link> teaches the same six
        objectives. The items are exam-mapped but still original practice material. There is no
        timer, and refreshing the page discards the attempt. The unmapped{" "}
        <Link to="/learn/context-window">Context Window sample lesson</Link> remains available.
      </Callout>

      <section className="section" aria-labelledby="available-assessments">
        <div className="section-heading-row">
          <h2 className="section-title" id="available-assessments">
            Domain 2 practice set
          </h2>
          <span className="section-note">14 reviewed items · mapped to all 6 objectives</span>
        </div>

        {practiceAssessment && practiceQuestions.length > 0 ? (
          <AssessmentRunner definition={practiceAssessment} questions={practiceQuestions} />
        ) : (
          <EmptyState
            icon={ListChecks}
            title="No assessment definitions are available"
            actions={
              <Link className="button button--secondary" to="/learn/evaluation-basics">
                Read the Domain 2 lesson
              </Link>
            }
          >
            The content registry did not resolve a runnable assessment. Lesson knowledge checks
            remain available.
          </EmptyState>
        )}
      </section>

      <section className="section" aria-labelledby="planned-modes">
        <div className="section-heading-row">
          <h2 className="section-title" id="planned-modes">
            Next practice capabilities
          </h2>
          <span className="section-note">Not implemented in this phase</span>
        </div>
        <div className="row-list">
          {plannedModes.map((mode, index) => (
            <div className="row" key={mode.title}>
              <span className="row-start" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="row-body">
                <span className="row-title">{mode.title}</span>
                <span className="row-meta">{mode.note}</span>
              </span>
              <span className="row-tail">Planned</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
