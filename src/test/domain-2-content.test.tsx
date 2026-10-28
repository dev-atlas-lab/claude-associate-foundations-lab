import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import {
  contentPack,
  getDomain,
  getLesson,
  getQuestionBankEntry,
  primaryBlueprint,
  publishedLessons,
  questionBankEntries,
} from "../content";
import { ThemeProvider } from "../hooks/ThemeProvider";
import { routes } from "../router";
import { installMatchMedia } from "./match-media";

const domain = getDomain("output-evaluation-validation")!;
const lesson = getLesson("evaluation-basics")!;
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

describe("Domain 2 curriculum coverage", () => {
  it("publishes a verified lesson mapped to every Domain 2 objective", () => {
    expect(lesson.kind).toBe("curriculum");
    expect(lesson.contentStatus).toBe("published");
    expect(lesson.examMapping.status).toBe("verified");
    expect([...lesson.examMapping.objectiveIds].sort()).toEqual(
      domain.objectives.map((objective) => objective.id).sort(),
    );
    expect(lesson.objectives.length).toBeGreaterThanOrEqual(domain.objectives.length);
  });

  it("gives every Domain 2 objective at least two reviewed bank items", () => {
    const domainObjectiveIds = new Set(domain.objectives.map((objective) => objective.id));
    const domainTwoEntries = questionBankEntries.filter((entry) =>
      entry.examMapping.objectiveIds.some((objectiveId) => domainObjectiveIds.has(objectiveId)),
    );
    const counts = new Map<string, number>();

    for (const entry of domainTwoEntries) {
      const objectiveId = entry.examMapping.objectiveIds[0]!;
      counts.set(objectiveId, (counts.get(objectiveId) ?? 0) + 1);
    }

    for (const objective of domain.objectives) {
      expect(counts.get(objective.id) ?? 0).toBeGreaterThanOrEqual(2);
    }

    expect(domainTwoEntries).toHaveLength(14);
    expect(
      domainTwoEntries.filter((entry) => entry.question.id.startsWith("output-bias-")),
    ).toHaveLength(2);

    const coveredObjectiveIds = new Set(
      questionBankEntries.flatMap((entry) => entry.examMapping.objectiveIds),
    );
    const allObjectiveIds = primaryBlueprint.domains.flatMap((blueprintDomain) =>
      blueprintDomain.objectives.map((objective) => objective.id),
    );

    expect(coveredObjectiveIds.size).toBe(30);
    expect(
      allObjectiveIds.filter((objectiveId) => !coveredObjectiveIds.has(objectiveId)),
    ).toHaveLength(0);
  });

  it("keeps the unmapped Context Window sample out of the reviewed Domain 2 bank", () => {
    const contextWindowLesson = getLesson("context-window");

    expect(contextWindowLesson?.examMapping.status).toBe("unmapped");
    expect(questionBankEntries.some((entry) => entry.question.id === "context-window-root-cause")).toBe(
      false,
    );
    expect(publishedLessons).toHaveLength(8);
    expect(publishedLessons.filter((published) => published.kind === "sample")).toHaveLength(1);
  });

  it("resolves lesson sources, related questions, and question review records", () => {
    for (const sourceId of lesson.sourceIds) {
      expect(knownSourceIds.has(sourceId)).toBe(true);
      expect(lesson.verification.sourceIds).toContain(sourceId);
    }

    expect(lesson.relatedQuestionIds.length).toBeGreaterThanOrEqual(domain.objectives.length);

    const lessonObjectiveIds = new Set(lesson.examMapping.objectiveIds);
    const relatedObjectiveIds = new Set<string>();

    for (const questionId of lesson.relatedQuestionIds) {
      const entry = getQuestionBankEntry(questionId);

      expect(entry).toBeDefined();
      expect(entry?.examMapping.status).toBe("verified");
      expect(entry?.question.sourceIds.every((sourceId) => knownSourceIds.has(sourceId))).toBe(
        true,
      );

      for (const objectiveId of entry?.examMapping.objectiveIds ?? []) {
        expect(lessonObjectiveIds.has(objectiveId)).toBe(true);
        relatedObjectiveIds.add(objectiveId);
      }
    }

    expect(relatedObjectiveIds).toEqual(lessonObjectiveIds);
  });

  it("keeps the lesson knowledge checks in English with Vietnamese feedback", () => {
    for (const question of lesson.questions) {
      expect(question.stem).not.toMatch(vietnameseDiacriticPattern);
      expect(question.correctExplanation).toMatch(vietnameseDiacriticPattern);

      for (const choice of question.choices) {
        expect(choice.text).not.toMatch(vietnameseDiacriticPattern);
        expect(choice.explanation).toMatch(vietnameseDiacriticPattern);
      }

      for (const sourceId of question.sourceIds) {
        expect(knownSourceIds.has(sourceId)).toBe(true);
      }
    }
  });
});

describe("Domain 2 lesson route", () => {
  beforeEach(() => {
    installMatchMedia(true);
  });

  it("renders the lesson, its reviewed-practice references, and a working knowledge check", async () => {
    const user = userEvent.setup();
    renderRoute("/learn/evaluation-basics");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Đánh giá output: accuracy, evidence và human review",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Câu hỏi luyện tập đã rà soát" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mở bộ Domain 2 practice" })).toHaveAttribute(
      "href",
      "/practice",
    );

    await user.click(
      screen.getByRole("radio", {
        name: /Verify the unsupported statistic and the required competitor/i,
      }),
    );
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("status")).toHaveTextContent("Chính xác");
    expect(screen.getAllByText(/Vì sao không chọn/)).toHaveLength(3);
  });
});
