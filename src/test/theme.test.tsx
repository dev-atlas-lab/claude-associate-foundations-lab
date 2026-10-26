import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter, MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../hooks/ThemeProvider";
import { THEME_STORAGE_KEY } from "../lib/theme";
import { SettingsPage } from "../pages/SettingsPage";
import { routes } from "../router";
import { installMatchMedia, type MatchMediaController } from "./match-media";

function renderSettings() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <SettingsPage />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

function appearanceGroup() {
  return screen.getByRole("group", { name: "Theme" });
}

describe("theme behaviour", () => {
  let media: MatchMediaController;

  beforeEach(() => {
    media = installMatchMedia(true);
  });

  it("starts on the dark theme for a new visitor", () => {
    renderSettings();

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.themePreference).toBe("dark");
    expect(within(appearanceGroup()).getByRole("radio", { name: /^dark/i })).toBeChecked();
  });

  it("switches to Light and persists the choice", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(within(appearanceGroup()).getByRole("radio", { name: /^light/i }));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(within(appearanceGroup()).getByRole("radio", { name: /^light/i })).toBeChecked();
  });

  it("follows the operating system while System is selected", async () => {
    media = installMatchMedia(false);
    const user = userEvent.setup();
    renderSettings();

    await user.click(within(appearanceGroup()).getByRole("radio", { name: /^system/i }));
    expect(document.documentElement.dataset.theme).toBe("light");

    act(() => media.setPrefersDark(true));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("restores a stored preference on the next visit", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    renderSettings();

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(within(appearanceGroup()).getByRole("radio", { name: /^light/i })).toBeChecked();
  });

  it("resets back to the dark default and clears storage", async () => {
    const user = userEvent.setup();
    localStorage.setItem(THEME_STORAGE_KEY, "system");
    renderSettings();

    await user.click(screen.getByRole("button", { name: /reset preferences/i }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByRole("status")).toHaveTextContent(/back to dark/i);
  });

  it("switches theme from the topbar control", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/"] })} />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Light theme" }));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(screen.getByRole("button", { name: "Light theme" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
