import { describe, expect, it } from "vitest";

import { greet } from "./index";

describe("greet", () => {
  it("builds a friendly message", () => {
    expect(greet("team")).toContain("team");
  });
});
