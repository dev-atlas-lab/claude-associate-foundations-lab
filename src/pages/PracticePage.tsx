import { ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { publishedLessons } from "../content";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const plannedModes = [
  {
    title: "Domain practice",
    note: "Short English scenario sets per verified exam domain, with Vietnamese explanations after each answer.",
  },
  {
    title: "Mixed sets",
    note: "Questions sampled across domains so you have to choose the right approach, not just recall a definition.",
  },
  {
    title: "Flag for review",
    note: "Mark uncertain questions while practising; flagged items feed the Review page.",
  },
];

export function PracticePage() {
  useDocumentTitle("Practice");

  return (
    <div className="page">
      <PageHeader
        eyebrow="Practice"
        title="Practice questions"
        lede="Scenario-based questions in English with Vietnamese explanations, built to test judgement rather than definitions. The engine does not exist yet, so this page documents what is coming instead of offering a fake start button."
        meta={<Badge tone="warn">Not implemented</Badge>}
      />

      <Callout tone="note" title="What exists now">
        The CCAO-F blueprint is verified for exams before 2026-11-17, but the question bank is
        still empty and the practice engine is not built. The sample lesson has one English
        knowledge check you can try today.
      </Callout>

      <section className="section" aria-labelledby="planned-modes">
        <div className="section-heading-row">
          <h2 className="section-title" id="planned-modes">
            Planned modes
          </h2>
          <span className="section-note">Design agreed, implementation later</span>
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

      <section className="section">
        <EmptyState
          icon={ListChecks}
          title="No questions to attempt yet"
          actions={
            <Link className="button button--secondary" to={`/learn/${publishedLessons[0].id}`}>
              Try the sample knowledge check
            </Link>
          }
        >
          The sample lesson ends with one English question and a full explanation of every option.
          That is the format the practice engine will scale up once the question bank is authored
          against the verified objectives.
        </EmptyState>
      </section>
    </div>
  );
}
