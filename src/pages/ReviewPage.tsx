import { ArrowLeft, ArrowRight, BookmarkCheck, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { allQuestions, getPracticeSet } from "../content";
import {
  deriveReviewItems,
  type AttemptOrigin,
  type ReviewItem,
  type ReviewReason,
} from "../domain";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { resolveStudyReviewItem, useStudyState } from "../persistence/study-store";

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

function originLabel(origin: AttemptOrigin): string {
  if (origin.kind === "practice") {
    return getPracticeSet(origin.practiceSetId)?.assessment.title ?? origin.practiceSetId;
  }

  return "Mock exam preview";
}

function formatSubmittedAt(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function outcomeLabel(item: ReviewItem): string {
  if (item.score.outcome === "correct") {
    return "Correct, flagged";
  }

  if (item.score.outcome === "unanswered") {
    return "Unanswered";
  }

  return "Incorrect";
}

function itemHref(item: ReviewItem, reason: ReasonFilter): string {
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

export function ReviewPage() {
  useDocumentTitle("Review");
  const snapshot = useStudyState();
  const [searchParams] = useSearchParams();
  const [resolvedMessage, setResolvedMessage] = useState<string>();

  const items = deriveReviewItems(snapshot.state, questionById);
  const reason = parseReason(searchParams.get("reason"));
  const filteredItems =
    reason === "all" ? items : items.filter((item) => item.reasons.includes(reason));
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

    const markReviewed = () => {
      resolveStudyReviewItem(detail.attemptId, detail.question.id);
      setResolvedMessage("Marked reviewed. This item left the queue.");
    };

    return (
      <div className="page">
        <PageHeader
          eyebrow="Review"
          title="Review mistakes"
          lede={`${originLabel(detail.origin)} · submitted ${formatSubmittedAt(detail.submittedAt)}`}
          meta={
            <>
              {detail.reasons.map((itemReason) => (
                <Badge key={itemReason} tone={itemReason === "flagged" ? "warn" : "info"}>
                  {reasonLabels[itemReason]}
                </Badge>
              ))}
              <Badge>{outcomeLabel(detail)}</Badge>
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

          <div className="review-actions">
            <button type="button" className="button button--primary" onClick={markReviewed}>
              <Check size={14} strokeWidth={2} aria-hidden="true" />
              Mark reviewed
            </button>
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
            Opening an item never resolves it. Mark reviewed only when you have read the
            explanation and decided what to change.
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
                      {originLabel(item.origin)} · {formatSubmittedAt(item.submittedAt)} ·{" "}
                      {item.question.type === "multiple-response"
                        ? "Multiple-response"
                        : "Single-choice"}
                    </span>
                    <span className="review-item-reasons">
                      {item.reasons.map((itemReason) => (
                        <Badge
                          key={itemReason}
                          tone={itemReason === "flagged" ? "warn" : "info"}
                        >
                          {reasonLabels[itemReason]}
                        </Badge>
                      ))}
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
