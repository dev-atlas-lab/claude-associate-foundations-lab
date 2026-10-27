import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "../hooks/ThemeProvider";
import { MockExamPage } from "../pages/MockExamPage";
import { ProgressPage } from "../pages/ProgressPage";
import { SettingsPage } from "../pages/SettingsPage";
import { STUDY_STORAGE_KEY } from "../persistence/storage";

function renderPage(page: ReactNode) {
  return render(
    <ThemeProvider>
      <MemoryRouter>{page}</MemoryRouter>
    </ThemeProvider>,
  );
}

describe("mock exam preview page", () => {
  it("reports the selected count, shortfall, and zero-availability domain", () => {
    renderPage(<MockExamPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Mock exam" })).toBeInTheDocument();
    expect(screen.getByText("24/60 items")).toBeInTheDocument();
    expect(screen.getByText(/shortfall of 36/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start assessment" })).toBeInTheDocument();

    const table = screen.getByRole("table");
    const domainFiveRow = within(table).getByRole("row", {
      name: /Configuration and Knowledge Management/i,
    });

    expect(within(domainFiveRow).getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
      "12%",
      "0",
      "0",
    ]);
  });
});

describe("progress page", () => {
  it("separates bank coverage from empty personal performance", () => {
    renderPage(<ProgressPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Learning progress" })).toBeInTheDocument();
    expect(screen.getByText("24 reviewed items")).toBeInTheDocument();
    expect(screen.getByText("15/30")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No submitted attempts yet" })).toBeInTheDocument();
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
});
