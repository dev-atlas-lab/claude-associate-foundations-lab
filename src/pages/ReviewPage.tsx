import { ArrowLeft, ArrowRight, BookmarkCheck, Check, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import {
  allQuestions,
  getQuestionCurriculumContext,
  primaryBlueprint,
  questionBankEntries,
} from "../content";
import {
  calculateAssessmentResult,
  createAssessmentContext,
  type AssessmentSession,
  type ReviewReason,
} from "../domain";
import { AssessmentRunner } from "../features/assessment/components/AssessmentRunner";
import {
  buildReviewPracticeSet,
  deriveAggregatedReviewItems,
  findCorrectlyAnsweredStudyReviewItems,
  type AggregatedReviewItem,
  type ReviewPracticeSet,
} from "../features/progress/selectors";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { resolveStudyReviewItem, useStudyState } from "../persistence/study-store";
import { useTimedExamState } from "../persistence/timed-exam-store";

const questionById = new Map(allQuestions.map((question) => [question.id, question]));

const reasonLabels: Record<ReviewReason, string> = {
  incorrect: "Incorrect",
  unanswered: "Unanswered",
  flagged: "Flagged",
};

const reasonDescriptions: Record<ReviewReason, string> = {
  incorrect: "Bạn đã chọn một tập đáp án chưa đúng.",
  unanswered: "Bạn chưa trả lời câu này khi submit.",
  flagged: "Bạn đã đánh dấu câu này để xem lại.",
};

type ReasonFilter = ReviewReason | "all";

function parseReason(value: string | null): ReasonFilter {
  return value === "incorrect" || value === "unanswered" || value === "flagged" ? value : "all";
}

function formatSubmittedAt(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function outcomeLabel(item: AggregatedReviewItem): string {
  if (item.score.outcome === "correct") {
    return "Correct, flagged";
  }

  if (item.score.outcome === "unanswered") {
    return "Unanswered";
  }

  return "Incorrect";
}

function itemHref(item: AggregatedReviewItem, reason: ReasonFilter): string {
  const params = new URLSearchParams();
  params.set("item", item.key);

  if (reason !== "all") {
    params.set("reason", reason);
  }

  return `/review?${params.toString()}`;
}

function filterHref(reason: ReasonFilter): string {
  return reason === "all" ? "/review" : `/review?reason=${reason}`;
}

function practiceHref(reason: ReasonFilter): string {
  const params = new URLSearchParams();
  if (reason !== "all") {
    params.set("reason", reason);
  }
  params.set("mode", "practice");
  return `/review?${params.toString()}`;
}

function ReviewPracticeView({
  initialPracticeSet,
  reason,
  currentOpenItems,
}: {
  initialPracticeSet: ReviewPracticeSet | null;
  reason: ReasonFilter;
  currentOpenItems: readonly AggregatedReviewItem[];
}) {
  const [frozenSet] = useState<ReviewPracticeSet | null>(() => initialPracticeSet);
  const [submittedSession, setSubmittedSession] = useState<AssessmentSession | null>(null);
  const [resolvedInThisRun, setResolvedInThisRun] = useState(0);

  if (frozenSet === null) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Review"
          title="Review mistakes"
          lede="Focused in-memory practice over the open questions in your review queue."
          meta={<Badge>0 questions</Badge>}
        />
        <EmptyState
          icon={BookmarkCheck}
          title="No open review items to practice"
          actions={
            <Link className="button button--secondary" to={filterHref(reason)}>
              Back to review queue
            </Link>
          }
        >
          There are no open review items matching this filter right now. Return to the review queue
          or start a practice set.
        </EmptyState>
      </div>
    );
  }

  const submittedResult =
    submittedSession !== null && submittedSession.status === "submitted"
      ? calculateAssessmentResult(
          createAssessmentContext(frozenSet.definition, frozenSet.questions),
          submittedSession,
        )
      : null;
  const currentOpenKeySet = new Set(currentOpenItems.map((item) => item.key));
  const allCorrectStudyItems =
    submittedResult === null
      ? []
      : findCorrectlyAnsweredStudyReviewItems(frozenSet.sourceItems, submittedResult);
  const remainingCorrectStudyItems = allCorrectStudyItems.filter((item) =>
    currentOpenKeySet.has(item.key),
  );

  return (
    <div className="page">
      <PageHeader
        eyebrow="Review"
        title="Review mistakes"
        lede="Practice open review items in memory without seeing the answer key first. Submitting does not alter attempt history; you can optionally mark the items you answered correctly as reviewed."
        meta={
          <>
            <Badge tone="accent">
              {frozenSet.questions.length} unique{" "}
              {frozenSet.questions.length === 1 ? "question" : "questions"}
            </Badge>
            <Badge>In-memory practice</Badge>
          </>
        }
        actions={
          <Link className="button button--ghost" to={filterHref(reason)}>
            <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
            Review queue
          </Link>
        }
      />

      <AssessmentRunner
        definition={frozenSet.definition}
        questions={frozenSet.questions}
        persisted={false}
        onSessionChange={(session) => {
          setSubmittedSession(session.status === "submitted" ? session : null);
        }}
      />

      {submittedResult !== null ? (
        <section
          className="card review-practice-resolution"
          aria-labelledby="review-practice-resolution-title"
        >
          <h2 className="section-title" id="review-practice-resolution-title">
            Review queue resolution
          </h2>
          {remainingCorrectStudyItems.length > 0 ? (
            <>
              <p className="section-copy">
                You answered {submittedResult.correctAnswers} of {submittedResult.totalQuestions}{" "}
                {submittedResult.totalQuestions === 1 ? "question" : "questions"} correctly.{" "}
                {remainingCorrectStudyItems.length} open study-queue{" "}
                {remainingCorrectStudyItems.length === 1 ? "item matches" : "items match"} those
                correct answers and can be marked reviewed now.
              </p>
              <div className="review-actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => {
                    for (const item of remainingCorrectStudyItems) {
                      resolveStudyReviewItem(item.attemptId, item.question.id);
                    }
                    setResolvedInThisRun((prev) => prev + remainingCorrectStudyItems.length);
                  }}
                >
                  <Check size={14} strokeWidth={2} aria-hidden="true" />
                  Mark {remainingCorrectStudyItems.length} correct{" "}
                  {remainingCorrectStudyItems.length === 1 ? "item" : "items"} reviewed
                </button>
                <Link className="button button--secondary" to={filterHref(reason)}>
                  Back to review queue
                </Link>
              </div>
            </>
          ) : resolvedInThisRun > 0 ? (
            <>
              <p className="section-copy" role="status">
                Marked {resolvedInThisRun} correct {resolvedInThisRun === 1 ? "item" : "items"}{" "}
                reviewed. They have been removed from your open review queue.
              </p>
              <div className="review-actions">
                <Link className="button button--secondary" to={filterHref(reason)}>
                  Back to review queue
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="section-copy">
                {submittedResult.correctAnswers === 0
                  ? "No questions were answered correctly in this practice run, so all open items remain in your review queue."
                  : "No resolvable study-queue items remain for the questions answered correctly (items from the saved timed mock exam slot remain linked to that timed result)."}
              </p>
              <div className="review-actions">
                <Link className="button button--secondary" to={filterHref(reason)}>
                  Back to review queue
                </Link>
              </div>
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}

export function ReviewPage() {
  useDocumentTitle("Review");
  const snapshot = useStudyState();
  const timedSnapshot = useTimedExamState();
  const [searchParams] = useSearchParams();
  const [resolvedMessage, setResolvedMessage] = useState<string>();

  const items = deriveAggregatedReviewItems(
    snapshot.state,
    questionById,
    questionBankEntries,
    primaryBlueprint,
    timedSnapshot.session,
  );
  const reason = parseReason(searchParams.get("reason"));
  const filteredItems =
    reason === "all" ? items : items.filter((item) => item.reasons.includes(reason));
  const practiceSet = buildReviewPracticeSet(filteredItems, reason);
  const isPracticeMode = searchParams.get("mode") === "practice";
  const itemKey = searchParams.get("item");
  const detail = itemKey ? items.find((item) => item.key === itemKey) : undefined;

  const counts = {
    all: items.length,
    incorrect: items.filter((item) => item.reasons.includes("incorrect")).length,
    unanswered: items.filter((item) => item.reasons.includes("unanswered")).length,
    flagged: items.filter((item) => item.reasons.includes("flagged")).length,
  };

  useEffect(() => {
    if (resolvedMessage) {
      document.getElementById("review-resolved-title")?.focus();
    }
  }, [resolvedMessage]);

  if (isPracticeMode) {
    return (
      <ReviewPracticeView
        key={reason}
        initialPracticeSet={practiceSet}
        reason={reason}
        currentOpenItems={items}
      />
    );
  }

  if (itemKey && !detail) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Review"
          title="Review mistakes"
          lede="Review items are derived from submitted attempts and disappear only after you mark them reviewed."
          meta={<Badge tone="ok">Queue up to date</Badge>}
        />
        <EmptyState
          icon={Check}
          title={resolvedMessage ?? "This item is no longer in the review queue"}
          titleId="review-resolved-title"
          titleFocusable={Boolean(resolvedMessage)}
          actions={
            <Link className="button button--secondary" to={filterHref(reason)}>
              Back to review queue
            </Link>
          }
        >
          {resolvedMessage ??
            "It may have been resolved in another tab, or the link is from an older attempt. Nothing was changed by opening this page."}
        </EmptyState>
      </div>
    );
  }

  if (detail) {
    const navigationItems = filteredItems.some((item) => item.key === detail.key)
      ? filteredItems
      : items;
    const index = navigationItems.findIndex((item) => item.key === detail.key);
    const previous = index > 0 ? navigationItems[index - 1] : undefined;
    const next =
      index >= 0 && index < navigationItems.length - 1 ? navigationItems[index + 1] : undefined;
    const detailContext = getQuestionCurriculumContext(detail.question.id);
    const detailSources = detailContext?.sources ?? [];

    const markReviewed = () => {
      if (!detail.resolvableInStudyStore) {
        return;
      }

      resolveStudyReviewItem(detail.attemptId, detail.question.id);
      setResolvedMessage("Marked reviewed. This item left the queue.");
    };

    return (
      <div className="page">
        <PageHeader
          eyebrow="Review"
          title="Review mistakes"
          lede={`${detail.originLabel} · submitted ${formatSubmittedAt(detail.submittedAt)}`}
          meta={
            <>
              {detail.reasons.map((itemReason) => (
                <Badge key={itemReason} tone={itemReason === "flagged" ? "warn" : "info"}>
                  {reasonLabels[itemReason]}
                </Badge>
              ))}
              <Badge>{outcomeLabel(detail)}</Badge>
              {detail.repeatMissCount > 1 ? (
                <Badge tone="warn">Missed in {detail.repeatMissCount} attempts</Badge>
              ) : null}
              {detail.storageKey === "cfl.timed-exam.v1" ? (
                <Badge tone="accent">Saved timed exam slot</Badge>
              ) : null}
            </>
          }
          actions={
            <Link className="button button--ghost" to={filterHref(reason)}>
              <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
              Review queue
            </Link>
          }
        />

        <article className="review-detail card">
          <div className="review-detail-head">
            <span className="assessment-kicker">Review item</span>
            <h2 className="review-detail-title" lang="en">
              {detail.question.stem}
            </h2>
            <p className="quiz-instruction" lang="en">
              {detail.question.type === "multiple-response"
                ? "Select all answers that apply."
                : "Select one answer."}
            </p>
          </div>

          <ul className="review-choices">
            {detail.question.choices.map((choice, index) => {
              const isCorrect = detail.question.correctChoiceIds.includes(choice.id);
              const isSelected = detail.score.selectedChoiceIds.includes(choice.id);
              const state = isCorrect ? "correct" : isSelected ? "incorrect" : undefined;

              return (
                <li className="review-choice" key={choice.id} data-state={state}>
                  <span className="review-choice-key" aria-hidden="true">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="review-choice-body">
                    <span className="review-choice-text" lang="en">
                      {choice.text}
                    </span>
                    {isCorrect || isSelected ? (
                      <span className="review-choice-note" lang="en">
                        {isCorrect ? "Correct answer" : "Your answer"}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>

          <div
            className="quiz-feedback"
            data-result={detail.score.isCorrect ? "correct" : "incorrect"}
          >
            <p className="quiz-feedback-title">
              {detail.score.isCorrect
                ? "Chính xác"
                : detail.score.outcome === "unanswered"
                  ? "Chưa trả lời"
                  : "Chưa đúng"}
            </p>
            <p className="quiz-feedback-text">{detail.question.correctExplanation}</p>
            <ul className="quiz-explanations">
              {detail.question.choices.map((choice, index) => (
                <li className="quiz-explanation" key={choice.id}>
                  <span className="quiz-explanation-key">
                    {String.fromCharCode(65 + index)}.{" "}
                    {detail.question.correctChoiceIds.includes(choice.id)
                      ? "Đáp án đúng"
                      : "Vì sao không chọn"}
                  </span>
                  <span className="quiz-explanation-text">{choice.explanation}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="review-reason-list">
            {detail.reasons.map((itemReason) => (
              <p className="review-reason" key={itemReason}>
                <span className="review-reason-label">{reasonLabels[itemReason]}</span>
                <span>{reasonDescriptions[itemReason]}</span>
              </p>
            ))}
          </div>

          {detail.domainCode && detail.domainTitle && detail.objectiveStatement ? (
            <div className="question-curriculum-context">
              <h3 className="question-context-title">Mục tiêu & bài học liên quan</h3>
              <p className="question-context-meta">
                <span className="data-table-code">D{detail.domainCode}</span>{" "}
                <strong>
                  Domain {detail.domainCode}: {detail.domainTitle}
                </strong>{" "}
                — <span lang="en">{detail.objectiveStatement}</span>
              </p>
              {detail.repeatMissCount > 1 ? (
                <p className="question-context-note">
                  Repeated mistake: câu hỏi này đã trả lời sai trong {detail.repeatMissCount} lần nộp
                  bài.
                </p>
              ) : null}
              <div className="question-context-links">
                {detail.lessonId && detail.lessonTitle ? (
                  <Link className="inline-link" to={`/learn/${detail.lessonId}`}>
                    Ôn lại bài học: {detail.lessonTitle}
                  </Link>
                ) : null}
                {detail.practiceSetId ? (
                  <Link
                    className="inline-link"
                    to={`/practice?set=${encodeURIComponent(detail.practiceSetId)}`}
                  >
                    Luyện tập Domain {detail.domainCode}
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          {detailSources.length > 0 ? (
            <div className="timed-sources">
              <h3 className="timed-sources-title">Nguồn tham chiếu</h3>
              <ul className="timed-source-list">
                {detailSources.map((source) => (
                  <li className="timed-source" key={source.id}>
                    <a className="inline-link" href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                    <span className="timed-source-meta">
                      {source.publisher} · truy cập {source.accessedAt}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="review-actions">
            {detail.resolvableInStudyStore ? (
              <button type="button" className="button button--primary" onClick={markReviewed}>
                <Check size={14} strokeWidth={2} aria-hidden="true" />
                Mark reviewed
              </button>
            ) : (
              <Link className="button button--secondary" to="/mock-exam/timed">
                Open timed exam result
              </Link>
            )}
            {previous ? (
              <Link className="button button--secondary" to={itemHref(previous, reason)}>
                <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
                Previous item
              </Link>
            ) : null}
            {next ? (
              <Link className="button button--secondary" to={itemHref(next, reason)}>
                Next item
                <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
              </Link>
            ) : null}
          </div>
          <p className="review-hint">
            {detail.resolvableInStudyStore
              ? "Opening an item never resolves it. Mark reviewed only when you have read the explanation and decided what to change."
              : "This item comes from your saved timed mock exam slot (cfl.timed-exam.v1). It remains visible here while that timed result is retained."}
          </p>
        </article>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Review"
        title="Review mistakes"
        lede="A queue derived from submitted attempts: incorrect answers, unanswered questions, and anything you flagged, including correct-but-flagged items. Review state is saved locally."
        meta={
          <>
            <Badge tone={items.length > 0 ? "warn" : "ok"}>{items.length} open items</Badge>
            <Badge>{snapshot.state.reviewResolutions.length} resolved</Badge>
          </>
        }
        actions={
          practiceSet ? (
            <Link className="button button--primary" to={practiceHref(reason)}>
              <Play size={14} strokeWidth={2} aria-hidden="true" />
              Practice open items ({practiceSet.questions.length})
            </Link>
          ) : undefined
        }
      />

      <Callout tone="note" title="The queue is derived, not guessed">
        Every item below comes from a submitted attempt and keeps its origin and submission time.
        Opening an item shows the answer key and per-option rationale; it does not remove the item.
        Use <strong>Mark reviewed</strong> to resolve it explicitly.
      </Callout>

      <section className="section" aria-labelledby="review-queue">
        <div className="section-heading-row">
          <h2 className="section-title" id="review-queue">
            Open queue
          </h2>
          <span className="section-note">{filteredItems.length} shown</span>
        </div>

        <nav className="study-filters" aria-label="Review reason filters">
          {(
            [
              ["all", "All"],
              ["incorrect", "Incorrect"],
              ["unanswered", "Unanswered"],
              ["flagged", "Flagged"],
            ] as const
          ).map(([value, label]) => (
            <Link
              className="study-filter"
              key={value}
              to={filterHref(value)}
              aria-current={reason === value ? "page" : undefined}
            >
              {label}
              <span className="study-filter-count">{counts[value]}</span>
            </Link>
          ))}
        </nav>

        {filteredItems.length === 0 ? (
          <EmptyState
            icon={BookmarkCheck}
            title={items.length === 0 ? "Nothing to review yet" : "No items match this filter"}
            actions={
              items.length === 0 ? (
                <Link className="button button--secondary" to="/practice">
                  Start a practice set
                </Link>
              ) : (
                <Link className="button button--secondary" to="/review">
                  Show all open items
                </Link>
              )
            }
          >
            {items.length === 0
              ? "Submit a practice set or mock-exam preview. Incorrect, unanswered, and flagged questions will appear here automatically."
              : "Try another reason filter, or show all open items."}
          </EmptyState>
        ) : (
          <ul className="review-list" aria-label="Open review items">
            {filteredItems.map((item) => (
              <li className="review-item" key={item.key}>
                <Link className="review-item-link" to={itemHref(item, reason)}>
                  <span className="review-item-body">
                    <span className="review-item-stem" lang="en">
                      {item.question.stem}
                    </span>
                    <span className="review-item-meta">
                      {item.originLabel} · {formatSubmittedAt(item.submittedAt)} ·{" "}
                      {item.question.type === "multiple-response"
                        ? "Multiple-response"
                        : "Single-choice"}
                    </span>
                    {item.domainCode && item.domainTitle && item.objectiveStatement ? (
                      <span className="review-item-objective">
                        <span className="data-table-code">D{item.domainCode}</span> Domain{" "}
                        {item.domainCode}: {item.domainTitle} —{" "}
                        <span lang="en">{item.objectiveStatement}</span>
                      </span>
                    ) : null}
                    <span className="review-item-reasons">
                      {item.reasons.map((itemReason) => (
                        <Badge
                          key={itemReason}
                          tone={itemReason === "flagged" ? "warn" : "info"}
                        >
                          {reasonLabels[itemReason]}
                        </Badge>
                      ))}
                      {item.repeatMissCount > 1 ? (
                        <Badge tone="warn">Missed in {item.repeatMissCount} attempts</Badge>
                      ) : null}
                      {item.storageKey === "cfl.timed-exam.v1" ? (
                        <Badge tone="accent">Saved timed exam slot</Badge>
                      ) : null}
                    </span>
                  </span>
                  <span className="review-item-tail">
                    {outcomeLabel(item)}
                    <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
