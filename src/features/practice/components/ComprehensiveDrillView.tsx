import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Flag,
  HelpCircle,
  RotateCcw,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Badge } from "../../../components/ui/Badge";
import {
  primaryBlueprint,
  questionBankEntries,
} from "../../../content";
import {
  comprehensiveDrillStore,
  useComprehensiveDrill,
} from "../../../persistence/comprehensive-drill-store";

const bankQuestions = questionBankEntries.map((e) => e.question);

function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

// Map each objective to its domain for quick lookup
const domainByObjectiveId = new Map<
  string,
  { id: string; code: string; title: string }
>();

for (const domain of primaryBlueprint.domains) {
  for (const objective of domain.objectives) {
    domainByObjectiveId.set(objective.id, {
      id: domain.id,
      code: domain.code,
      title: domain.title,
    });
  }
}

// Map question id to its domain and objective info
const questionMetaById = new Map<
  string,
  {
    domainCode: string;
    domainTitle: string;
    domainId: string;
    objectiveId: string;
  }
>();

for (const entry of questionBankEntries) {
  const objectiveId = entry.examMapping.objectiveIds[0] ?? "";
  const domain = domainByObjectiveId.get(objectiveId);
  questionMetaById.set(entry.question.id, {
    domainCode: domain?.code ?? "?",
    domainTitle: domain?.title ?? "General",
    domainId: domain?.id ?? "",
    objectiveId,
  });
}

export type DrillStatusFilter = "all" | "unattempted" | "correct" | "incorrect" | "flagged";

export function ComprehensiveDrillView() {
  const drillState = useComprehensiveDrill();
  const searchInputId = useId();

  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<DrillStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState<string>(() => {
    return drillState.lastActiveQuestionId ?? bankQuestions[0]?.id ?? "";
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Overall Statistics across all 105 questions
  const stats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    let incorrect = 0;
    let flagged = 0;

    for (const q of bankQuestions) {
      const answers = drillState.answers[q.id];
      const isRevealed = drillState.revealed[q.id];
      if (drillState.flags[q.id]) {
        flagged++;
      }

      if (answers && answers.length > 0 && isRevealed) {
        answered++;
        const isExactMatch =
          answers.length === q.correctChoiceIds.length &&
          answers.every((id) => q.correctChoiceIds.includes(id));

        if (isExactMatch) {
          correct++;
        } else {
          incorrect++;
        }
      }
    }

    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    return {
      total: bankQuestions.length,
      answered,
      correct,
      incorrect,
      flagged,
      accuracy,
    };
  }, [drillState]);

  // Filtered list of questions based on Domain, Status, and Search query
  const filteredQuestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return bankQuestions.filter((question) => {
      const meta = questionMetaById.get(question.id);

      // Domain filter
      if (selectedDomain !== "all" && meta?.domainId !== selectedDomain) {
        return false;
      }

      // Status filter
      const userAnswers = drillState.answers[question.id] ?? [];
      const isRevealed = drillState.revealed[question.id] ?? false;
      const isFlagged = drillState.flags[question.id] ?? false;
      const isAnswered = userAnswers.length > 0 && isRevealed;
      const isCorrect =
        isAnswered &&
        userAnswers.length === question.correctChoiceIds.length &&
        userAnswers.every((id) => question.correctChoiceIds.includes(id));

      if (selectedStatus === "unattempted" && isAnswered) {
        return false;
      }
      if (selectedStatus === "correct" && !isCorrect) {
        return false;
      }
      if (selectedStatus === "incorrect" && (!isAnswered || isCorrect)) {
        return false;
      }
      if (selectedStatus === "flagged" && !isFlagged) {
        return false;
      }

      // Search query filter
      if (q) {
        const stemMatch = question.stem.toLowerCase().includes(q);
        const choicesMatch = question.choices.some((c) =>
          c.text.toLowerCase().includes(q),
        );
        const metaMatch =
          meta?.domainCode.toLowerCase().includes(q) ||
          meta?.domainTitle.toLowerCase().includes(q);

        if (!stemMatch && !choicesMatch && !metaMatch) {
          return false;
        }
      }

      return true;
    });
  }, [selectedDomain, selectedStatus, searchQuery, drillState]);

  // Ensure current question is valid within the filtered list or fall back
  const currentQuestion = useMemo(() => {
    const foundInFiltered = filteredQuestions.find((q) => q.id === activeQuestionId);
    if (foundInFiltered) {
      return foundInFiltered;
    }
    if (filteredQuestions.length > 0) {
      return filteredQuestions[0];
    }
    return bankQuestions.find((q) => q.id === activeQuestionId) ?? bankQuestions[0];
  }, [filteredQuestions, activeQuestionId]);

  const currentIndex = currentQuestion
    ? bankQuestions.findIndex((q) => q.id === currentQuestion.id)
    : 0;

  const currentMeta = currentQuestion ? questionMetaById.get(currentQuestion.id) : undefined;
  const userAnswers = currentQuestion ? (drillState.answers[currentQuestion.id] ?? []) : [];
  const isRevealed = currentQuestion ? (drillState.revealed[currentQuestion.id] ?? false) : false;
  const isFlagged = currentQuestion ? (drillState.flags[currentQuestion.id] ?? false) : false;

  const isMultipleResponse = currentQuestion?.type === "multiple-response";
  const isCorrect =
    currentQuestion &&
    userAnswers.length === currentQuestion.correctChoiceIds.length &&
    userAnswers.every((id) => currentQuestion.correctChoiceIds.includes(id));

  const handleSelectChoice = (choiceId: string) => {
    if (!currentQuestion) {
      return;
    }
    comprehensiveDrillStore.selectChoice(
      currentQuestion.id,
      choiceId,
      isMultipleResponse,
    );
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion) {
      return;
    }
    comprehensiveDrillStore.revealAnswer(currentQuestion.id);
  };

  const handleRetry = () => {
    if (!currentQuestion) {
      return;
    }
    comprehensiveDrillStore.retryQuestion(currentQuestion.id);
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) {
      return;
    }
    comprehensiveDrillStore.toggleFlag(currentQuestion.id);
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (filteredQuestions.length === 0) {
      return;
    }
    const currentFilteredIdx = filteredQuestions.findIndex(
      (q) => q.id === currentQuestion?.id,
    );
    if (currentFilteredIdx === -1) {
      if (filteredQuestions[0]) {
        setActiveQuestionId(filteredQuestions[0].id);
      }
      return;
    }

    if (direction === "prev" && currentFilteredIdx > 0) {
      const prev = filteredQuestions[currentFilteredIdx - 1];
      if (prev) {
        setActiveQuestionId(prev.id);
        comprehensiveDrillStore.setLastActiveQuestionId(prev.id);
      }
    } else if (direction === "next" && currentFilteredIdx < filteredQuestions.length - 1) {
      const next = filteredQuestions[currentFilteredIdx + 1];
      if (next) {
        setActiveQuestionId(next.id);
        comprehensiveDrillStore.setLastActiveQuestionId(next.id);
      }
    }
  };

  return (
    <div className="comprehensive-drill" role="region" aria-label="Chế độ ôn tập toàn diện tức thì">
      {/* Overview Statistics Banner */}
      <section className="drill-stats-banner" aria-label="Thống kê tiến độ ôn tập toàn diện">
        <div className="drill-stats-head">
          <div className="drill-stats-title-group">
            <h3 className="drill-stats-title">
              <Sparkles size={16} strokeWidth={2.2} aria-hidden="true" />
              Tiến độ ôn tập tức thì (Instant Feedback Drill)
            </h3>
            <p className="drill-stats-desc">
              Chế độ luyện tập mở trên toàn bộ 105 câu hỏi có đáp án và giải thích chi tiết tiếng Việt tức thì sau mỗi lần chọn.
            </p>
          </div>
          <button
            type="button"
            className="button button--ghost button--sm"
            onClick={() => setShowResetConfirm(true)}
            title="Đặt lại toàn bộ tiến độ làm bài"
          >
            <RotateCcw size={13} strokeWidth={2} aria-hidden="true" />
            Làm lại từ đầu
          </button>
        </div>

        <div className="stat-grid drill-stat-grid">
          <div className="stat">
            <dt className="stat-label">Tổng số câu</dt>
            <dd className="stat-value">{stats.total}</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Đã làm</dt>
            <dd className="stat-value">
              {stats.answered} <span className="stat-sub">({Math.round((stats.answered / stats.total) * 100)}%)</span>
            </dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Đúng</dt>
            <dd className="stat-value text-ok">{stats.correct}</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Sai</dt>
            <dd className="stat-value text-danger">{stats.incorrect}</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Tỉ lệ đúng</dt>
            <dd className="stat-value">{stats.accuracy}%</dd>
          </div>
          <div className="stat">
            <dt className="stat-label">Đã gắn cờ</dt>
            <dd className="stat-value text-warn">{stats.flagged}</dd>
          </div>
        </div>

        {showResetConfirm ? (
          <div className="drill-reset-confirm" role="alert">
            <span>Bạn có chắc chắn muốn xóa toàn bộ lịch sử đáp án đã làm trong chế độ ôn tập này không?</span>
            <div className="drill-reset-actions">
              <button
                type="button"
                className="button button--danger button--sm"
                onClick={() => {
                  comprehensiveDrillStore.resetAll();
                  setShowResetConfirm(false);
                }}
              >
                Xác nhận xóa
              </button>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => setShowResetConfirm(false)}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Filter and Search Controls */}
      <section className="drill-controls" aria-label="Bộ lọc câu hỏi">
        <div className="drill-filter-row">
          <div className="study-filters" role="group" aria-label="Lọc theo Domain">
            <button
              type="button"
              className="study-filter"
              aria-pressed={selectedDomain === "all"}
              onClick={() => setSelectedDomain("all")}
            >
              Tất cả Domain (105)
            </button>
            {primaryBlueprint.domains.map((d) => {
              const count = bankQuestions.filter(
                (q) => questionMetaById.get(q.id)?.domainId === d.id,
              ).length;
              return (
                <button
                  key={d.id}
                  type="button"
                  className="study-filter"
                  aria-pressed={selectedDomain === d.id}
                  onClick={() => setSelectedDomain(d.id)}
                >
                  D{d.code} ({count})
                </button>
              );
            })}
          </div>

          <div className="drill-search-box">
            <Search size={14} className="drill-search-icon" aria-hidden="true" />
            <input
              id={searchInputId}
              type="search"
              className="drill-search-input"
              placeholder="Tìm kiếm nội dung câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm câu hỏi"
            />
            {searchQuery ? (
              <button
                type="button"
                className="drill-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X size={13} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="drill-status-filter-row">
          <div className="drill-status-group" role="group" aria-label="Lọc theo trạng thái làm bài">
            <button
              type="button"
              className={`drill-status-btn ${selectedStatus === "all" ? "drill-status-btn--active" : ""}`}
              aria-pressed={selectedStatus === "all"}
              onClick={() => setSelectedStatus("all")}
            >
              Tất cả trạng thái
            </button>
            <button
              type="button"
              className={`drill-status-btn ${selectedStatus === "unattempted" ? "drill-status-btn--active" : ""}`}
              aria-pressed={selectedStatus === "unattempted"}
              onClick={() => setSelectedStatus("unattempted")}
            >
              Chưa làm
            </button>
            <button
              type="button"
              className={`drill-status-btn ${selectedStatus === "correct" ? "drill-status-btn--active" : ""}`}
              aria-pressed={selectedStatus === "correct"}
              onClick={() => setSelectedStatus("correct")}
            >
              Đúng ({stats.correct})
            </button>
            <button
              type="button"
              className={`drill-status-btn ${selectedStatus === "incorrect" ? "drill-status-btn--active" : ""}`}
              aria-pressed={selectedStatus === "incorrect"}
              onClick={() => setSelectedStatus("incorrect")}
            >
              Sai ({stats.incorrect})
            </button>
            <button
              type="button"
              className={`drill-status-btn ${selectedStatus === "flagged" ? "drill-status-btn--active" : ""}`}
              aria-pressed={selectedStatus === "flagged"}
              onClick={() => setSelectedStatus("flagged")}
            >
              Đã gắn cờ ({stats.flagged})
            </button>
          </div>

          <span className="drill-match-count">
            Hiển thị <strong>{filteredQuestions.length}</strong> / {bankQuestions.length} câu
          </span>
        </div>
      </section>

      {/* Fast Question Navigator Matrix */}
      <section className="drill-nav-matrix" aria-label="Bảng số câu hỏi">
        <div className="drill-nav-grid" role="group" aria-label="Danh sách câu hỏi ôn tập">
          {filteredQuestions.map((q) => {
            const indexInFullBank = bankQuestions.findIndex((item) => item.id === q.id);
            const userAns = drillState.answers[q.id] ?? [];
            const revealed = drillState.revealed[q.id] ?? false;
            const flagged = drillState.flags[q.id] ?? false;
            const isAns = userAns.length > 0 && revealed;
            const exact =
              isAns &&
              userAns.length === q.correctChoiceIds.length &&
              userAns.every((id) => q.correctChoiceIds.includes(id));
            const isActive = q.id === currentQuestion?.id;

            let stateClass = "drill-btn--unattempted";
            if (isAns) {
              stateClass = exact ? "drill-btn--correct" : "drill-btn--incorrect";
            }

            return (
              <button
                key={q.id}
                type="button"
                className={`drill-matrix-btn ${stateClass} ${isActive ? "drill-matrix-btn--active" : ""}`}
                aria-pressed={isActive}
                aria-label={`Câu ${indexInFullBank + 1}${flagged ? " (Đã gắn cờ)" : ""}${isAns ? (exact ? " (Đúng)" : " (Sai)") : " (Chưa làm)"}`}
                onClick={() => {
                  setActiveQuestionId(q.id);
                  comprehensiveDrillStore.setLastActiveQuestionId(q.id);
                }}
              >
                <span>{indexInFullBank + 1}</span>
                {flagged ? <span className="drill-btn-flag-dot" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Question Card with Instant Feedback */}
      {currentQuestion ? (
        <article className="drill-card" aria-labelledby="drill-question-stem">
          <div className="drill-card-header">
            <div className="drill-card-badges">
              <Badge tone="ok">Domain {currentMeta?.domainCode ?? "?"}</Badge>
              <Badge tone="accent">{currentMeta?.domainTitle ?? "Domain"}</Badge>
              <Badge>{isMultipleResponse ? "Multiple response" : "Single choice"}</Badge>
              <span className="drill-counter">
                Câu <strong>{currentIndex + 1}</strong> / {bankQuestions.length}
              </span>
            </div>

            <button
              type="button"
              className={`button button--ghost button--sm ${isFlagged ? "drill-flag-active" : ""}`}
              onClick={handleToggleFlag}
              aria-pressed={isFlagged}
              title={isFlagged ? "Bỏ gắn cờ câu này" : "Gắn cờ để ôn lại sau"}
            >
              <Flag size={14} strokeWidth={2} aria-hidden="true" />
              {isFlagged ? "Đã gắn cờ" : "Gắn cờ"}
            </button>
          </div>

          <form
            className="quiz drill-quiz"
            onSubmit={(e) => e.preventDefault()}
          >
            <fieldset className="fieldset">
              <legend
                className="quiz-legend drill-legend"
                id="drill-question-stem"
                lang="en"
              >
                {currentQuestion.stem}
              </legend>

              <p className="quiz-instruction" lang="en">
                {isMultipleResponse
                  ? "Select all answers that apply (Multiple-response requires exact set)."
                  : "Select one answer (Instant verification & explanation will appear)."}
              </p>

              <div className="quiz-options">
                {currentQuestion.choices.map((choice, idx) => {
                  const isChecked = userAnswers.includes(choice.id);
                  const isChoiceCorrect = currentQuestion.correctChoiceIds.includes(choice.id);

                  let optionState: "correct" | "incorrect" | undefined = undefined;
                  let noteText: string | undefined = undefined;

                  if (isRevealed) {
                    if (isChoiceCorrect) {
                      optionState = "correct";
                      noteText = isChecked ? "Your correct answer" : "Correct answer";
                    } else if (isChecked) {
                      optionState = "incorrect";
                      noteText = "Your incorrect answer";
                    }
                  }

                  return (
                    <label
                      key={choice.id}
                      className="quiz-option"
                      data-state={optionState}
                    >
                      <input
                        type={isMultipleResponse ? "checkbox" : "radio"}
                        name={`drill-choice-${currentQuestion.id}`}
                        value={choice.id}
                        checked={isChecked}
                        onChange={() => handleSelectChoice(choice.id)}
                      />
                      <span className="quiz-option-body">
                        <span className="quiz-option-label" lang="en">
                          <strong>{optionLetter(idx)}.</strong> {choice.text}
                        </span>
                        {noteText ? (
                          <span className="quiz-option-note" lang="en">
                            {noteText}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Check answer action for multiple-response before reveal */}
            {isMultipleResponse && !isRevealed ? (
              <div className="drill-action-row">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={handleCheckAnswer}
                  disabled={userAnswers.length === 0}
                >
                  <Check size={14} strokeWidth={2.2} aria-hidden="true" />
                  Kiểm tra đáp án & Xem giải thích
                </button>
                <span className="assessment-hint">
                  Chọn các đáp án đúng rồi ấn nút để kiểm tra kết quả ngay lập tức.
                </span>
              </div>
            ) : null}

            {/* Instant Feedback & Explanations Panel */}
            {isRevealed ? (
              <div
                className="quiz-feedback drill-feedback"
                data-result={isCorrect ? "correct" : "incorrect"}
                role="status"
              >
                <div className="drill-feedback-head">
                  <p className="quiz-feedback-title">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
                        Chính xác! (Correct)
                      </>
                    ) : (
                      <>
                        <XCircle size={18} strokeWidth={2.4} aria-hidden="true" />
                        Chưa chính xác (Incorrect)
                      </>
                    )}
                  </p>
                  <button
                    type="button"
                    className="button button--secondary button--sm"
                    onClick={handleRetry}
                  >
                    <RotateCcw size={13} strokeWidth={2} aria-hidden="true" />
                    Làm lại câu này
                  </button>
                </div>

                <div className="drill-takeaway-box">
                  <strong>Giải thích cốt lõi (Key Takeaway):</strong>
                  <p className="quiz-feedback-text">{currentQuestion.correctExplanation}</p>
                </div>

                <div className="drill-explanations-wrap">
                  <h4 className="drill-explanations-title">Phân tích chi tiết từng phương án:</h4>
                  <ul className="quiz-explanations">
                    {currentQuestion.choices.map((choice, idx) => {
                      const isChoiceCorrect = currentQuestion.correctChoiceIds.includes(choice.id);
                      return (
                        <li className="quiz-explanation" key={choice.id}>
                          <span className="quiz-explanation-key">
                            <strong>{optionLetter(idx)}.</strong>{" "}
                            {isChoiceCorrect ? (
                              <span className="text-ok">✓ ĐÚNG:</span>
                            ) : (
                              <span className="text-muted">– SAI:</span>
                            )}
                          </span>
                          <span className="quiz-explanation-text">{choice.explanation}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="drill-objective-ref">
                  <HelpCircle size={13} aria-hidden="true" />
                  <span>Ánh xạ Official Objective: <code>{currentMeta?.objectiveId}</code></span>
                </div>
              </div>
            ) : null}

            {/* Bottom Navigation Buttons */}
            <div className="drill-bottom-nav">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => handleNavigate("prev")}
                disabled={filteredQuestions.findIndex((q) => q.id === currentQuestion.id) <= 0}
              >
                <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
                Câu trước
              </button>

              <div className="drill-quick-jumper">
                <span className="section-note">
                  {filteredQuestions.findIndex((q) => q.id === currentQuestion.id) + 1} / {filteredQuestions.length} câu trong danh sách lọc
                </span>
              </div>

              <button
                type="button"
                className="button button--primary"
                onClick={() => handleNavigate("next")}
                disabled={
                  filteredQuestions.findIndex((q) => q.id === currentQuestion.id) >=
                  filteredQuestions.length - 1
                }
              >
                Câu tiếp theo
                <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </form>
        </article>
      ) : (
        <div className="empty-state">
          <p>Không tìm thấy câu hỏi nào phù hợp với bộ lọc đã chọn.</p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              setSelectedDomain("all");
              setSelectedStatus("all");
              setSearchQuery("");
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
