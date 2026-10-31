import { ArrowLeft, BookOpen, ListChecks, RotateCcw, Search, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Callout } from "../components/ui/Callout";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import {
  allQuestions,
  getAssessmentQuestions,
  practiceSets,
  questionBankEntries,
  type PracticeSetSummary,
} from "../content";
import {
  calculateAttemptResult,
  findActiveAttempt,
  findLatestSubmittedAttempt,
  type StudyState,
} from "../domain";
import { ComprehensiveDrillView } from "../features/practice/components/ComprehensiveDrillView";
import { PersistedAssessment } from "../features/study/components/PersistedAssessment";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useStudyState } from "../persistence/study-store";

const practiceQuestionById = new Map(
  allQuestions.map((question) => [question.id, question]),
);

function domainLabel(codes: string[]): string {
  return codes.map((code) => `Domain ${code}`).join(" · ");
}

/**
 * The leading badge is a fixed-width slot, so it can only hold a short token.
 * A single-domain set keeps its domain number; a set that spans several
 * domains uses a compact "M" instead of concatenating every domain code.
 */
function practiceSetBadge(practiceSet: PracticeSetSummary): string {
  const [onlyDomain] = practiceSet.domains;

  if (onlyDomain && practiceSet.domains.length === 1) {
    return onlyDomain.code;
  }

  if (practiceSet.assessment.id === "high-weight-core-set") {
    return "HW";
  }
  if (practiceSet.assessment.id === "quick-drill-set") {
    return "QD";
  }
  if (practiceSet.assessment.id === "enterprise-scenarios-set") {
    return "EN";
  }

  return "M";
}

export type PracticeCategory = "all" | "domains" | "specialized";
export type PracticeStatusFilter = "all" | "not-started" | "in-progress" | "completed";

export interface PracticeSetActivityStatus {
  tone: "neutral" | "accent" | "ok";
  label: string;
  kind: "not-started" | "in-progress" | "completed";
}

function derivePracticeSetStatus(
  state: StudyState,
  practiceSet: PracticeSetSummary,
): PracticeSetActivityStatus {
  const assessmentId = practiceSet.assessment.id;
  const activeAttempt = findActiveAttempt(state, assessmentId);
  const submittedAttempts = state.attempts.filter(
    (attempt) =>
      attempt.session.assessmentId === assessmentId &&
      attempt.session.status === "submitted" &&
      attempt.session.submittedAt !== undefined &&
      attempt.questionIds.every((questionId) => practiceQuestionById.has(questionId)),
  );
  const latestSubmitted = submittedAttempts[submittedAttempts.length - 1];
  const submittedCount = submittedAttempts.length;
  const attemptsLabel = submittedCount === 1 ? "1 attempt" : `${submittedCount} attempts`;

  if (activeAttempt) {
    const answeredCount = activeAttempt.questionIds.filter(
      (questionId) => (activeAttempt.session.answers[questionId]?.length ?? 0) > 0,
    ).length;
    const totalCount = activeAttempt.questionIds.length;

    if (latestSubmitted) {
      const latestResult = calculateAttemptResult(latestSubmitted, practiceQuestionById);
      return {
        tone: "accent",
        label: `In progress (${answeredCount}/${totalCount} answered) · Last: ${latestResult.rawPercentage}% · ${attemptsLabel}`,
        kind: "in-progress",
      };
    }

    return {
      tone: "accent",
      label: `In progress (${answeredCount}/${totalCount} answered)`,
      kind: "in-progress",
    };
  }

  if (latestSubmitted) {
    const latestResult = calculateAttemptResult(latestSubmitted, practiceQuestionById);
    return {
      tone: "ok",
      label: `Completed (Last: ${latestResult.rawPercentage}% · ${attemptsLabel})`,
      kind: "completed",
    };
  }

  return {
    tone: "neutral",
    label: "Not started",
    kind: "not-started",
  };
}

export function PracticePage() {
  useDocumentTitle("Practice");
  const [searchParams] = useSearchParams();
  const snapshot = useStudyState();
  const [mode, setMode] = useState<"sets" | "drill">(() => {
    return searchParams.get("mode") === "drill" ? "drill" : "sets";
  });
  const [categoryFilter, setCategoryFilter] = useState<PracticeCategory>("all");
  const [statusFilter, setStatusFilter] = useState<PracticeStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedSetId = searchParams.get("set");
  const selectedSet = selectedSetId
    ? practiceSets.find((practiceSet) => practiceSet.assessment.id === selectedSetId)
    : undefined;
  const unknownSet = selectedSetId !== null && selectedSet === undefined;

  const categoryCounts = useMemo(() => {
    let domainCount = 0;
    let specCount = 0;
    for (const set of practiceSets) {
      if (set.domains.length === 1) {
        domainCount++;
      } else {
        specCount++;
      }
    }
    return {
      all: practiceSets.length,
      domains: domainCount,
      specialized: specCount,
    };
  }, []);

  const filteredSets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return practiceSets.filter((practiceSet) => {
      if (categoryFilter === "domains" && practiceSet.domains.length !== 1) {
        return false;
      }
      if (categoryFilter === "specialized" && practiceSet.domains.length <= 1) {
        return false;
      }

      if (statusFilter !== "all") {
        const status = derivePracticeSetStatus(snapshot.state, practiceSet);
        if (status.kind !== statusFilter) {
          return false;
        }
      }

      if (q) {
        const titleMatch = practiceSet.assessment.title.toLowerCase().includes(q);
        const descMatch =
          practiceSet.assessment.description?.toLowerCase().includes(q) ?? false;
        const domainMatch = practiceSet.domains.some(
          (d) =>
            d.code.toLowerCase().includes(q) ||
            d.title.toLowerCase().includes(q) ||
            `domain ${d.code}`.includes(q),
        );
        if (!titleMatch && !descMatch && !domainMatch) {
          return false;
        }
      }

      return true;
    });
  }, [categoryFilter, statusFilter, searchQuery, snapshot.state]);

  if (selectedSet) {
    const questions = getAssessmentQuestions(selectedSet.assessment);
    const activeAttempt = findActiveAttempt(snapshot.state, selectedSet.assessment.id);
    const latestSubmitted = findLatestSubmittedAttempt(
      snapshot.state,
      selectedSet.assessment.id,
    );
    const initialSession = activeAttempt?.session ?? latestSubmitted?.session;

    return (
      <div className="page">
        <PageHeader
          eyebrow="Practice"
          title="Practice questions"
          lede={`${selectedSet.assessment.title} — ${selectedSet.questionCount} reviewed, original items. Questions are in English, explanations are in Vietnamese, and multiple-response items require the exact set.`}
          meta={
            <>
              <Badge tone="ok">{domainLabel(selectedSet.domains.map((domain) => domain.code))}</Badge>
              <Badge tone="ok">Reviewed bank</Badge>
              <Badge tone="warn">Not official</Badge>
            </>
          }
          actions={
            <Link className="button button--ghost" to="/practice">
              <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
              All practice sets
            </Link>
          }
        />

        <Callout tone="note" title="Saved in this browser">
          Every answer change is written to local storage, so you can refresh or close the tab and
          resume. {activeAttempt ? "An in-progress attempt is open below." : "A new attempt starts when you press Start."}{" "}
          Submitting locks the attempt; later review navigation does not rewrite it. This is
          practice, not an official CCAO-F form.
        </Callout>

        <section
          className="section"
          aria-label={`${selectedSet.assessment.title} practice set`}
        >
          <div className="section-heading-row">
            <h2 className="section-title" id="selected-set-heading">
              {selectedSet.assessment.title}
            </h2>
            <span className="section-note">
              {selectedSet.questionCount} items · {selectedSet.singleChoiceCount} single-choice /{" "}
              {selectedSet.multipleResponseCount} multiple-response
            </span>
          </div>

          {questions.length > 0 ? (
            <PersistedAssessment
              key={selectedSet.assessment.id}
              definition={selectedSet.assessment}
              questions={questions}
              origin={{ kind: "practice", practiceSetId: selectedSet.assessment.id }}
              initialSession={initialSession}
            />
          ) : (
            <EmptyState
              icon={ListChecks}
              title="This set has no runnable questions"
              actions={
                <Link className="button button--secondary" to="/practice">
                  Back to practice sets
                </Link>
              }
            >
              The content registry did not resolve any question for this set. Nothing was started
              or saved.
            </EmptyState>
          )}
        </section>
      </div>
    );
  }

  if (unknownSet) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Practice"
          title="Practice questions"
          lede="The requested practice set is not in the reviewed registry."
          meta={<Badge tone="warn">Unknown set</Badge>}
        />
        <EmptyState
          icon={ListChecks}
          title="That practice set was not found"
          actions={
            <Link className="button button--secondary" to="/practice">
              Back to practice sets
            </Link>
          }
        >
          The link may be out of date. Choose one of the reviewed sets from the practice index.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Practice"
        title="Practice questions"
        lede="Registry-driven sets over the reviewed question bank. Every set maps to official objectives, uses English question stems and choices, and explains each option in Vietnamese. These are original practice items, not official exam questions."
        meta={
          <>
            <Badge tone="ok">{practiceSets.length} reviewed sets</Badge>
            <Badge tone="ok">{questionBankEntries.length} bank items</Badge>
            <Badge tone="warn">Not official</Badge>
          </>
        }
      />

      <Callout tone="note" title="How practice works now">
        Pick a set, answer in English, and submit to see exact-set scoring plus a Vietnamese
        explanation for every option. Attempts are saved in this browser and can be resumed after a
        refresh. Flagged and incorrect items flow into the{" "}
        <Link to="/review">review queue</Link>; bank coverage and personal accuracy are separated on{" "}
        <Link to="/progress">Progress</Link>.
      </Callout>

      <div className="study-filters" role="group" aria-label="Practice mode" style={{ marginBottom: "var(--space-4)" }}>
        <button
          type="button"
          className="study-filter"
          aria-pressed={mode === "sets"}
          onClick={() => setMode("sets")}
        >
          <BookOpen size={14} strokeWidth={2} aria-hidden="true" />
          <span>Topic-based sets ({practiceSets.length} sets)</span>
        </button>
        <button
          type="button"
          className="study-filter"
          aria-pressed={mode === "drill"}
          onClick={() => setMode("drill")}
        >
          <Sparkles size={14} strokeWidth={2} aria-hidden="true" />
          <span>Comprehensive Drill — Instant check ({questionBankEntries.length} items)</span>
        </button>
      </div>

      {mode === "drill" ? (
        <ComprehensiveDrillView />
      ) : (
        <div>
          <section className="section" aria-labelledby="available-sets">
            <div className="section-heading-row">
              <h2 className="section-title" id="available-sets">
                Reviewed practice sets
              </h2>
              <span className="section-note">
                {practiceSets.length} sets · {questionBankEntries.length} reviewed items
              </span>
            </div>

            <div className="practice-toolbar" role="region" aria-label="Practice filters and search">
              <div className="study-filters" role="group" aria-label="Filter by practice category">
                <button
                  className="study-filter"
                  type="button"
                  aria-pressed={categoryFilter === "all"}
                  onClick={() => setCategoryFilter("all")}
                >
                  All sets ({categoryCounts.all})
                </button>
                <button
                  className="study-filter"
                  type="button"
                  aria-pressed={categoryFilter === "domains"}
                  onClick={() => setCategoryFilter("domains")}
                >
                  By domain ({categoryCounts.domains})
                </button>
                <button
                  className="study-filter"
                  type="button"
                  aria-pressed={categoryFilter === "specialized"}
                  onClick={() => setCategoryFilter("specialized")}
                >
                  Specialized & Quick drills ({categoryCounts.specialized})
                </button>
              </div>

              <div className="practice-toolbar-row">
                <div className="practice-search-wrap">
                  <Search className="practice-search-icon" size={16} strokeWidth={2} aria-hidden="true" />
                  <input
                    className="practice-search-input"
                    type="search"
                    placeholder="Search set title, domain, keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search practice sets"
                  />
                  {searchQuery ? (
                    <button
                      className="practice-search-clear"
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search input"
                    >
                      <X size={14} strokeWidth={2} aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                <div className="practice-status-wrap">
                  <label className="practice-status-label" htmlFor="practice-status-filter">
                    Status:
                  </label>
                  <select
                    className="practice-status-select"
                    id="practice-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as PracticeStatusFilter)}
                  >
                    <option value="all">All statuses</option>
                    <option value="not-started">Not started</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="practice-counts-summary">
                <span>
                  Showing {filteredSets.length} of {practiceSets.length} sets
                </span>
                {categoryFilter !== "all" || statusFilter !== "all" || searchQuery ? (
                  <button
                    className="button button--ghost button--sm"
                    type="button"
                    onClick={() => {
                      setCategoryFilter("all");
                      setStatusFilter("all");
                      setSearchQuery("");
                    }}
                  >
                    <RotateCcw size={12} strokeWidth={2} aria-hidden="true" />
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>

            {filteredSets.length > 0 ? (
              <div className="row-list">
                {filteredSets.map((practiceSet) => {
                  const status = derivePracticeSetStatus(snapshot.state, practiceSet);

                  return (
                    <Link
                      className="row"
                      key={practiceSet.assessment.id}
                      to={`/practice?set=${encodeURIComponent(practiceSet.assessment.id)}`}
                    >
                      <span className="row-start" aria-hidden="true">
                        {practiceSetBadge(practiceSet)}
                      </span>
                      <span className="row-body">
                        <span className="row-title">{practiceSet.assessment.title}</span>
                        <span className="row-meta">
                          {domainLabel(practiceSet.domains.map((domain) => domain.code))} ·{" "}
                          {practiceSet.objectiveIds.length} objectives · {practiceSet.questionCount} items ·{" "}
                          {practiceSet.singleChoiceCount} single-choice / {practiceSet.multipleResponseCount}{" "}
                          multiple-response
                        </span>
                        <span className="row-meta">
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </span>
                      </span>
                      <span className="row-tail">Open</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="No matching practice sets found"
                actions={
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => {
                      setCategoryFilter("all");
                      setStatusFilter("all");
                      setSearchQuery("");
                    }}
                  >
                    <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
                    Reset filters
                  </button>
                }
              >
                No practice sets match the current filter and search criteria. Try selecting another category or clearing your search.
              </EmptyState>
            )}
          </section>

          <section className="section">
            <Callout tone="note" title="Objective coverage is complete; depth still varies">
              The reviewed bank now has items for all seven official domains and every official
              objective. Depth differs by domain, and every item is original practice material rather
              than official exam content. The mixed set spans all domains, but it is practice, not a
              mock exam.
            </Callout>
          </section>
        </div>
      )}
    </div>
  );
}
