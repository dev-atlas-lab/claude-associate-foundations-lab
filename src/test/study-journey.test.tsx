import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PracticePage } from "../pages/PracticePage";
import { ReviewPage } from "../pages/ReviewPage";
import { STUDY_STORAGE_KEY } from "../persistence/storage";
import { reloadStudyStore } from "../persistence/study-store";

function renderPractice() {
  return render(
    <MemoryRouter initialEntries={["/practice?set=domain-2-output-validation-set"]}>
      <PracticePage />
    </MemoryRouter>,
  );
}

function renderReview() {
  return render(
    <MemoryRouter initialEntries={["/review"]}>
      <ReviewPage />
    </MemoryRouter>,
  );
}

async function submitEmptyAttempt() {
  const user = userEvent.setup();
  const view = renderPractice();

  await user.click(screen.getByRole("button", { name: "Start assessment" }));
  await user.click(screen.getByRole("button", { name: "Submit assessment" }));
  await user.click(screen.getByRole("button", { name: "Confirm submission" }));

  return { user, view };
}

function readEnvelope() {
  return JSON.parse(localStorage.getItem(STUDY_STORAGE_KEY) ?? "{}") as {
    schemaVersion?: number;
    state?: { attempts?: Array<{ session: { status: string } }> };
  };
}

describe("persisted study journey", () => {
  it("writes a submitted attempt, restores it, and starts a new attempt", async () => {
    const { user, view } = await submitEmptyAttempt();

    expect(screen.getByRole("heading", { name: "Kết quả luyện tập" })).toBeInTheDocument();
    expect(screen.getAllByText("0%").length).toBeGreaterThan(0);

    const envelope = readEnvelope();

    expect(envelope.schemaVersion).toBe(1);
    expect(envelope.state?.attempts).toHaveLength(1);
    expect(envelope.state?.attempts?.[0]?.session.status).toBe("submitted");

    view.unmount();
    reloadStudyStore();
    renderPractice();

    expect(await screen.findByRole("heading", { name: "Kết quả luyện tập" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New attempt" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New attempt" }));

    expect(await screen.findByText(/Question 1 of 14/)).toBeInTheDocument();
    expect(screen.getByText("Not answered")).toBeInTheDocument();

    const afterNewAttempt = readEnvelope();

    expect(afterNewAttempt.state?.attempts?.map((attempt) => attempt.session.status)).toEqual([
      "submitted",
      "in-progress",
    ]);
  });

  it("shows the derived queue and resolves an item only on request", async () => {
    const { view } = await submitEmptyAttempt();
    view.unmount();

    const review = renderReview();

    expect(screen.getByRole("heading", { name: "Review mistakes" })).toBeInTheDocument();
    expect(screen.getByText("14 open items")).toBeInTheDocument();

    const queueSection = screen.getByRole("heading", { name: "Open queue" }).closest("section");
    expect(queueSection).not.toBeNull();

    const user = userEvent.setup();
    await user.click(
      within(screen.getByRole("list", { name: "Open review items" })).getAllByRole("link")[0]!,
    );

    expect(screen.getByText("Review item")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark reviewed" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Review queue" }));

    expect(screen.getByText("14 open items")).toBeInTheDocument();

    await user.click(
      within(screen.getByRole("list", { name: "Open review items" })).getAllByRole("link")[0]!,
    );
    await user.click(screen.getByRole("button", { name: "Mark reviewed" }));

    expect(
      screen.getByRole("heading", { name: "Marked reviewed. This item left the queue." }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Back to review queue" }));

    expect(screen.getByText("13 open items")).toBeInTheDocument();
    expect(screen.getByText("1 resolved")).toBeInTheDocument();

    review.unmount();
  });
});
