import { ExternalLink, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Callout } from "../../../components/ui/Callout";
import type { Lesson, QuestionType, Source } from "../../../domain";
import { ContextWindowDiagram } from "../../visualizations/ContextWindowDiagram";
import { HallucinationEvaluationSandbox } from "../../visualizations/HallucinationEvaluationSandbox";
import { ModelSelectionMatrix } from "../../visualizations/ModelSelectionMatrix";
import { PromptCachingCostCalculator } from "../../visualizations/PromptCachingCostCalculator";
import { PromptLayeringWorkbench } from "../../visualizations/PromptLayeringWorkbench";
import { SafetyGuardrailsSimulator } from "../../visualizations/SafetyGuardrailsSimulator";
import { WorkflowPatternsSimulator } from "../../visualizations/WorkflowPatternsSimulator";
import { KnowledgeCheck } from "./KnowledgeCheck";

interface RelatedPracticeItem {
  id: string;
  type: QuestionType;
  objectiveStatement?: string;
}

export function LessonContent({
  lesson,
  sources,
  relatedPractice,
  practiceDomainLabel,
  practiceSetId,
}: {
  lesson: Lesson;
  sources: Source[];
  relatedPractice: RelatedPracticeItem[];
  practiceDomainLabel: string;
  practiceSetId?: string;
}) {
  const relatedObjectives = [
    ...new Set(
      relatedPractice.flatMap((item) =>
        item.objectiveStatement ? [item.objectiveStatement] : [],
      ),
    ),
  ];
  const practiceHref = practiceSetId
    ? `/practice?set=${encodeURIComponent(practiceSetId)}`
    : "/practice";
  return (
    <>
      <section
        className="lesson-section"
        id="lesson-objectives"
        aria-labelledby="lesson-objectives-title"
      >
        <div className="lesson-section-head">
          <span className="lesson-section-index" aria-hidden="true">
            00
          </span>
          <h2 className="lesson-section-title" id="lesson-objectives-title">
            Mục tiêu bài học
          </h2>
        </div>
        <ul className="objective-list">
          {lesson.objectives.map((objective) => (
            <li className="objective-item" key={objective}>
              <Target size={14} strokeWidth={2} aria-hidden="true" />
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </section>

      {lesson.sections.map((section, index) => {
        if (section.kind === "callout") {
          return (
            <div className="lesson-section" key={`callout-${index}`}>
              <Callout tone={section.tone} title={section.title}>
                {section.body}
              </Callout>
            </div>
          );
        }

        const number = lesson.sections
          .slice(0, index)
          .filter((candidate) => candidate.kind !== "callout").length + 1;
        const titleId = `lesson-section-${index}-title`;

        return (
          <section
            className="lesson-section"
            key={`${section.kind}-${index}`}
            id={`lesson-section-${index}`}
            aria-labelledby={titleId}
          >
            <div className="lesson-section-head">
              <span className="lesson-section-index" aria-hidden="true">
                {String(number).padStart(2, "0")}
              </span>
              <h2 className="lesson-section-title" id={titleId}>
                {section.heading}
              </h2>
            </div>

            {section.kind === "paragraphs" ? (
              <div className="lesson-prose">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}

            {section.kind === "list" ? (
              <ul className="bullet-list">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}

            {section.kind === "diagram" ? (
              section.diagramId === "context-budget" ? (
                <ContextWindowDiagram intro={section.intro} />
              ) : section.diagramId === "workflow-patterns-simulator" ? (
                <WorkflowPatternsSimulator intro={section.intro} />
              ) : section.diagramId === "prompt-caching-cost-calculator" ? (
                <PromptCachingCostCalculator intro={section.intro} />
              ) : section.diagramId === "prompt-layering-workbench" ? (
                <PromptLayeringWorkbench intro={section.intro} />
              ) : section.diagramId === "model-selection-matrix" ? (
                <ModelSelectionMatrix intro={section.intro} />
              ) : section.diagramId === "safety-guardrails-simulator" ? (
                <SafetyGuardrailsSimulator intro={section.intro} />
              ) : section.diagramId === "hallucination-evaluation-sandbox" ? (
                <HallucinationEvaluationSandbox intro={section.intro} />
              ) : (
                <Callout tone="note" title="Visualisation not available">
                  This lesson references the diagram <span className="mono">{section.diagramId}</span>,
                  but no renderer is registered for it yet.
                </Callout>
              )
            ) : null}
          </section>
        );
      })}

      <section className="lesson-section" id="lesson-terms" aria-labelledby="lesson-terms-title">
        <div className="lesson-section-head">
          <h2 className="lesson-section-title" id="lesson-terms-title">
            Thuật ngữ chính
          </h2>
        </div>
        <dl className="term-list">
          {lesson.keyTerms.map((term) => (
            <div className="term" key={term.en}>
              <dt className="term-en" lang="en">
                {term.en}
              </dt>
              <dd className="term-body">
                <span className="term-vi">{term.vi}</span>
                {term.note}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        className="lesson-section"
        id="lesson-scenario"
        aria-labelledby="lesson-scenario-title"
      >
        <div className="lesson-section-head">
          <h2 className="lesson-section-title" id="lesson-scenario-title">
            {lesson.scenario.title}
          </h2>
        </div>
        <div className="scenario">
          <p className="lesson-prose">{lesson.scenario.setup}</p>
          <ol className="scenario-steps">
            {lesson.scenario.steps.map((step) => (
              <li className="scenario-step" key={step}>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="scenario-takeaway">{lesson.scenario.takeaway}</p>
        </div>
      </section>

      {relatedPractice.length > 0 ? (
        <section
          className="lesson-section"
          id="lesson-related-practice"
          aria-labelledby="lesson-related-practice-title"
        >
          <div className="lesson-section-head">
            <h2 className="lesson-section-title" id="lesson-related-practice-title">
              Câu hỏi luyện tập đã rà soát
            </h2>
          </div>
          <p className="lesson-prose">
            Bộ {practiceDomainLabel} practice có {relatedPractice.length} câu liên kết trực tiếp với
            bài học này. Các câu hỏi dùng đúng format của kỳ thi: stem và lựa chọn bằng tiếng Anh,
            giải thích bằng tiếng Việt sau khi nộp.
          </p>
          {relatedObjectives.length > 0 ? (
            <ul className="bullet-list" lang="en">
              {relatedObjectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          ) : null}
          <p className="lesson-prose">
            <Link className="inline-link" to={practiceHref}>
              Mở bộ {practiceDomainLabel} practice
            </Link>
          </p>
        </section>
      ) : null}

      <section className="lesson-section" id="lesson-check" aria-labelledby="lesson-check-title">
        <div className="lesson-section-head">
          <h2 className="lesson-section-title" id="lesson-check-title">
            Knowledge check
          </h2>
        </div>
        <div className="quiz-stack">
          {lesson.questions.map((question) => (
            <KnowledgeCheck key={question.id} question={question} />
          ))}
        </div>
      </section>

      <section
        className="lesson-section"
        id="lesson-summary"
        aria-labelledby="lesson-summary-title"
      >
        <div className="lesson-section-head">
          <h2 className="lesson-section-title" id="lesson-summary-title">
            Tóm tắt
          </h2>
        </div>
        <ul className="bullet-list">
          {lesson.takeaways.map((takeaway) => (
            <li key={takeaway}>{takeaway}</li>
          ))}
        </ul>
        <div className="lesson-sources">
          <p className="section-note lesson-sources-title">
            Nguồn tham khảo
          </p>
          <ul className="source-list">
            {sources.map((source) => (
              <li key={source.id}>
                <a href={source.url} target="_blank" rel="noreferrer noopener" lang="en">
                  {source.publisher} — {source.title} <ExternalLink size={12} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
