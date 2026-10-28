import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import {
  contentPack,
  getAssessment,
  getAssessmentQuestions,
  getDomain,
  getLesson,
  getPracticeSet,
  getQuestionBankEntry,
  questionBankEntries,
} from "../content";
import {
  calculateAssessmentResult,
  chooseAnswer,
  createAssessmentContext,
  startAssessment,
  submitAssessment,
} from "../domain";
import { ThemeProvider } from "../hooks/ThemeProvider";
import { routes } from "../router";
import { installMatchMedia } from "./match-media";

const domain = getDomain("configuration-knowledge-management")!;
const lesson = getLesson("configuration-basics")!;
const assessment = getAssessment("domain-5-configuration-set")!;
const questions = getAssessmentQuestions(assessment);
const knownSourceIds = new Set(contentPack.sources.map((source) => source.id));
const vietnameseDiacriticPattern =
  /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;

function renderRoute(path: string) {
  render(
    <ThemeProvider>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
    </ThemeProvider>,
  );
}

function scoreAttempt(overrides: Record<string, string[]> = {}) {
  const context = createAssessmentContext(assessment, questions);
  let session = startAssessment(context, {
    sessionId: "domain-5-attempt",
    startedAt: "2026-10-27T09:00:00.000Z",
  });

  for (const question of questions) {
    const selection = overrides[question.id] ?? question.correctChoiceIds;
    session = chooseAnswer(context, session, question.id, selection);
  }

  return calculateAssessmentResult(
    context,
    submitAssessment(context, session, "2026-10-27T09:20:00.000Z").session,
  );
}

describe("Domain 5 curriculum coverage", () => {
  it("publishes a verified lesson mapped to every Domain 5 objective", () => {
    expect(lesson.kind).toBe("curriculum");
    expect(lesson.contentStatus).toBe("published");
    expect(lesson.examMapping.status).toBe("verified");
    expect([...lesson.examMapping.objectiveIds].sort()).toEqual(
      domain.objectives.map((objective) => objective.id).sort(),
    );
    expect(lesson.objectives.length).toBeGreaterThanOrEqual(domain.objectives.length);
    expect(lesson.sourceIds.length).toBeGreaterThan(0);
  });

  it("gives every Domain 5 objective two reviewed bank items", () => {
    const domainObjectiveIds = new Set(domain.objectives.map((objective) => objective.id));
    const counts = new Map<string, number>();

    for (const entry of questionBankEntries) {
      for (const objectiveId of entry.examMapping.objectiveIds) {
        if (domainObjectiveIds.has(objectiveId)) {
          counts.set(objectiveId, (counts.get(objectiveId) ?? 0) + 1);
        }
      }
    }

    for (const objective of domain.objectives) {
      expect(counts.get(objective.id) ?? 0).toBeGreaterThanOrEqual(2);
    }

    expect(counts.size).toBe(domain.objectives.length);
  });

  it("wires a Domain 5 practice set with all four objectives represented", () => {
    const practiceSet = getPracticeSet("domain-5-configuration-set");

    expect(practiceSet).toBeDefined();
    expect(practiceSet?.questionCount).toBe(8);
    expect(practiceSet?.domains.map((entry) => entry.id)).toEqual([
      "configuration-knowledge-management",
    ]);
    expect([...practiceSet!.objectiveIds].sort()).toEqual(
      domain.objectives.map((objective) => objective.id).sort(),
    );
  });

  it("cites registered sources from the lesson and the Domain 5 bank", () => {
    for (const sourceId of lesson.sourceIds) {
      expect(knownSourceIds.has(sourceId)).toBe(true);
      expect(lesson.verification.sourceIds).toContain(sourceId);
    }

    for (const question of questions) {
      for (const sourceId of question.sourceIds) {
        expect(knownSourceIds.has(sourceId)).toBe(true);
      }
    }
  });

  it("keeps Domain 5 stems and choices in English with Vietnamese feedback", () => {
    for (const question of questions) {
      expect(question.stem).not.toMatch(vietnameseDiacriticPattern);
      expect(question.correctExplanation).toMatch(vietnameseDiacriticPattern);

      for (const choice of question.choices) {
        expect(choice.text).not.toMatch(vietnameseDiacriticPattern);
        expect(choice.explanation).toMatch(vietnameseDiacriticPattern);
      }
    }
  });

  it("states the required selection count for multiple-response stems", () => {
    const multipleResponse = questions.filter(
      (question) => question.type === "multiple-response",
    );

    expect(multipleResponse).toHaveLength(4);

    for (const question of multipleResponse) {
      expect(question.stem).toMatch(/select (two|three|four)/i);
      expect(question.correctChoiceIds).toHaveLength(3);
    }
  });
});

describe("Domain 5 scoring", () => {
  it("scores exact selections as correct", () => {
    const result = scoreAttempt();

    expect(result.totalQuestions).toBe(8);
    expect(result.correctAnswers).toBe(8);
    expect(result.incorrectAnswers).toBe(0);
    expect(result.unansweredQuestions).toBe(0);
  });

  it("fails a multiple-response item that selects only part of the correct set", () => {
    const partialQuestion = questions.find(
      (question) => question.id === "config-connector-permission-model",
    )!;
    const result = scoreAttempt({
      [partialQuestion.id]: partialQuestion.correctChoiceIds.slice(0, 2),
    });
    const partial = result.questions.find(
      (score) => score.questionId === partialQuestion.id,
    )!;

    expect(partial.outcome).toBe("incorrect");
    expect(result.correctAnswers).toBe(7);
  });

  it("fails a multiple-response item that adds an extra incorrect choice", () => {
    const extraQuestion = questions.find(
      (question) => question.id === "config-project-context-scope",
    )!;
    const distractor = extraQuestion.choices.find(
      (choice) => !extraQuestion.correctChoiceIds.includes(choice.id),
    )!;
    const result = scoreAttempt({
      [extraQuestion.id]: [...extraQuestion.correctChoiceIds, distractor.id],
    });
    const extra = result.questions.find((score) => score.questionId === extraQuestion.id)!;

    expect(extra.outcome).toBe("incorrect");
    expect(result.correctAnswers).toBe(7);
  });
});

describe("Domain 5 lesson route", () => {
  beforeEach(() => {
    installMatchMedia(true);
  });

  it("renders the lesson, its reviewed-practice references, and a working knowledge check", async () => {
    const user = userEvent.setup();
    renderRoute("/learn/configuration-basics");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Cấu hình Claude: project, knowledge, connector và bảo trì",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Câu hỏi luyện tập đã rà soát" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mở bộ Domain 5 practice" })).toHaveAttribute(
      "href",
      "/practice?set=domain-5-configuration-set",
    );

    await user.click(
      screen.getByRole("radio", {
        name: /Put the PDF in project knowledge and the escalation rule/i,
      }),
    );
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("status")).toHaveTextContent("Chính xác");
    expect(screen.getAllByText(/Vì sao không chọn/)).toHaveLength(3);
  });

  it("links every related practice question to a verified bank entry", () => {
    for (const questionId of lesson.relatedQuestionIds) {
      const entry = getQuestionBankEntry(questionId);

      expect(entry?.examMapping.status).toBe("verified");
      expect(getAssessment("domain-5-configuration-set")?.questionIds).toContain(questionId);
    }
  });
});
