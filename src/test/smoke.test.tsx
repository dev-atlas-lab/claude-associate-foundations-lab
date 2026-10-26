import { describe, expect, it } from "vitest";

describe("starter test environment", () => {
  it("runs Vitest successfully", () => {
    expect("Claude Foundations Lab").toContain("Foundations");
  });
});
