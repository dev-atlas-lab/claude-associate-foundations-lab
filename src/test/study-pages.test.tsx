import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    expect(cells[1]).toBe("8");
    expect(Number(cells[2])).toBeGreaterThan(0);
    expect(Number(cells[2])).toBeLessThanOrEqual(8);
  });
});

describe("progress page", () => {
  it("separates bank coverage from empty personal performance", () => {
    renderPage(<ProgressPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Learning progress" })).toBeInTheDocument();
    expect(screen.getByText("62 reviewed items")).toBeInTheDocument();
    expect(screen.getByText("30/30")).toBeInTheDocument();
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
});
