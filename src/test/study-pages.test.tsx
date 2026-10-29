import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { getAssessment, getAssessmentQuestions } from "../content";
import {
  chooseAnswer,
  createAssessmentContext,
  startAssessment,
  submitAssessment,
} from "../domain";
import { StudyStorageNotice } from "../features/study/components/StudyStorageNotice";
import { ThemeProvider } from "../hooks/ThemeProvider";
import { DashboardPage } from "../pages/DashboardPage";
import { MockExamPage } from "../pages/MockExamPage";
import { ProgressPage } from "../pages/ProgressPage";
import { SettingsPage } from "../pages/SettingsPage";
import { STUDY_SCHEMA_VERSION, STUDY_STORAGE_KEY } from "../persistence/storage";
import {
  reloadStudyStore,
  resetStudyData,
  saveStudySession,
  startStudyAttempt,
} from "../persistence/study-store";

afterEach(() => {
  resetStudyData();
});

function renderPage(page: ReactNode) {
  return render(
    <ThemeProvider>
      <MemoryRouter>{page}</MemoryRouter>
    </ThemeProvider>,
  );
}

describe("mock exam preview page", () => {
  it("reports the selected count, no shortfall, and per-domain allocation", () => {
    renderPage(<MockExamPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Mock exam" })).toBeInTheDocument();
    expect(screen.getByText("60/60 items")).toBeInTheDocument();
    expect(screen.getByText(/No shortfall remains/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start assessment" })).toBeInTheDocument();

    const table = screen.getByRole("table");
    const domainFiveRow = within(table).getByRole("row", {
      name: /Configuration and Knowledge Management/i,
    });
    const cells = within(domainFiveRow).getAllByRole("cell").map((cell) => cell.textContent);

    expect(cells[0]).toBe("12%");
    expect(cells[1]).toBe("9");
    expect(Number(cells[2])).toBeGreaterThan(0);
    expect(Number(cells[2])).toBeLessThanOrEqual(9);
  });
});

describe("progress page", () => {
  it("separates bank coverage from empty personal performance", () => {
    renderPage(<ProgressPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Learning progress" })).toBeInTheDocument();
    expect(screen.getByText("72 reviewed items")).toBeInTheDocument();
    expect(screen.getByText("30/30")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No submitted attempts yet" })).toBeInTheDocument();
  });

  it("renders unique bank exposure, first-seen vs latest accuracy, 30-objective matrix, and attempt history", () => {
    const d5Def = getAssessment("domain-5-configuration-set")!;
    const d5Questions = getAssessmentQuestions(d5Def);
    const d5Context = createAssessmentContext(d5Def, d5Questions);
    let session = startAssessment(d5Context, {
      sessionId: "d5-prog-1",
      startedAt: "2026-10-28T09:00:00.000Z",
    });
    startStudyAttempt(d5Def, session, {
      kind: "practice",
      practiceSetId: d5Def.id,
    });
    session = chooseAnswer(
      d5Context,
      session,
      d5Questions[0]!.id,
      d5Questions[0]!.correctChoiceIds,
    );
    saveStudySession(
      submitAssessment(d5Context, session, "2026-10-28T09:10:00.000Z").session,
    );

    renderPage(<ProgressPage />);

    expect(screen.getByText("Unique bank exposure").closest(".stat")).toHaveTextContent("9/72");
    expect(screen.getByText("First-seen accuracy").closest(".stat")).toHaveTextContent("100%");
    expect(screen.getByText("Latest accuracy").closest(".stat")).toHaveTextContent("100%");

    const objTable = screen.getByRole("table", {
      name: "Objective coverage and latest outcomes across all 30 official objectives",
    });
    expect(within(objTable).getAllByRole("row")).toHaveLength(31); // header + 30 objectives

    const historyTable = screen.getByRole("table", {
      name: "Chronological submitted attempt history",
    });
    expect(within(historyTable).getAllByRole("row")).toHaveLength(2); // header + 1 attempt
    expect(within(historyTable).getByText("Domain 5: Configuration and Knowledge Management")).toBeInTheDocument();
  });
});

describe("settings local data", () => {
  it("shows the storage key and keeps destructive reset behind confirmation", () => {
    renderPage(<SettingsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Preferences" })).toBeInTheDocument();
    expect(screen.getAllByText(STUDY_STORAGE_KEY).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "Download study backup" }),
    ).toBeDisabled();

    expect(
      screen.queryByRole("button", { name: "Confirm reset study data" }),
    ).not.toBeInTheDocument();
  });

  it("moves focus into the reset confirmation and restores it on cancel", async () => {
    const user = userEvent.setup();
    renderPage(<SettingsPage />);

    const trigger = screen.getByRole("button", { name: "Reset study data" });
    await user.click(trigger);

    expect(
      screen.getByRole("button", { name: "Confirm reset study data" }),
    ).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(trigger).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: "Confirm reset study data" }),
    ).not.toBeInTheDocument();
  });

  it("migrates compatible attempts when the stored content fingerprint is stale", async () => {
    const d5Def = getAssessment("domain-5-configuration-set")!;
    const d5Questions = getAssessmentQuestions(d5Def);
    const d5Context = createAssessmentContext(d5Def, d5Questions);
    let session = startAssessment(d5Context, {
      sessionId: "d5-migratable-1",
      startedAt: "2026-10-28T09:00:00.000Z",
    });
    startStudyAttempt(d5Def, session, {
      kind: "practice",
      practiceSetId: d5Def.id,
    });
    session = chooseAnswer(
      d5Context,
      session,
      d5Questions[0]!.id,
      d5Questions[0]!.correctChoiceIds,
    );
    saveStudySession(
      submitAssessment(d5Context, session, "2026-10-28T09:05:00.000Z").session,
    );

    const savedEnvelope = JSON.parse(window.localStorage.getItem(STUDY_STORAGE_KEY)!) as {
      schemaVersion: number;
      contentFingerprint: string;
      savedAt: string;
      state: unknown;
    };
    window.localStorage.setItem(
      STUDY_STORAGE_KEY,
      JSON.stringify({
        ...savedEnvelope,
        schemaVersion: STUDY_SCHEMA_VERSION,
        contentFingerprint: "stale-fingerprint-before-c212",
      }),
    );
    reloadStudyStore();

    const user = userEvent.setup();
    renderPage(
      <main id="main-content" tabIndex={-1}>
        <StudyStorageNotice />
        <ProgressPage />
      </main>,
    );

    const alert = screen.getByRole("alert", { name: "Saved study data needs attention" });
    expect(alert).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "No submitted attempts yet" }),
    ).toBeInTheDocument();

    const migrateButton = within(alert).getByRole("button", {
      name: "Migrate compatible attempts (1)",
    });
    await user.click(migrateButton);

    expect(
      screen.queryByRole("alert", { name: "Saved study data needs attention" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Unique bank exposure").closest(".stat")).toHaveTextContent("9/72");
  });
});

describe("dashboard actionable study desk", () => {
  it("renders continue-active-study shortcuts and domain lesson/practice links", () => {
    const d5Def = getAssessment("domain-5-configuration-set")!;
    const d5Questions = getAssessmentQuestions(d5Def);
    const d5Context = createAssessmentContext(d5Def, d5Questions);
    let session = startAssessment(d5Context, {
      sessionId: "d5-dash-active",
      startedAt: "2026-10-29T01:00:00.000Z",
    });
    startStudyAttempt(d5Def, session, {
      kind: "practice",
      practiceSetId: d5Def.id,
    });
    session = chooseAnswer(
      d5Context,
      session,
      d5Questions[0]!.id,
      d5Questions[0]!.correctChoiceIds,
    );
    saveStudySession(session);

    renderPage(<DashboardPage />);

    expect(screen.getByRole("heading", { name: "Continue active study" })).toBeInTheDocument();
    expect(screen.getByText(/In progress · 1\/9 answered/)).toBeInTheDocument();

    const blueprintRegion = screen.getByRole("region", { name: "Exam blueprint" });
    const domainOneRow = within(blueprintRegion)
      .getAllByRole("generic")
      .find((el) => el.classList?.contains("row") && el.textContent?.includes("Prompting and Task Execution"))!;
    expect(
      within(domainOneRow).getByRole("link", { name: /Practice \(10 items\)/ }),
    ).toHaveAttribute("href", "/practice?set=domain-1-prompting-set");
  });
});
