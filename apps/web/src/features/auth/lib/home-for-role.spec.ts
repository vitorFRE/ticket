import { describe, expect, it } from "vitest";
import { homeForRole } from "@/features/auth/lib/home-for-role";

describe("homeForRole", () => {
  it("sends each role to its home", () => {
    expect(homeForRole("CLIENT")).toBe("/");
    expect(homeForRole("ORGANIZER")).toBe("/organizer/events");
    expect(homeForRole("GATE")).toBe("/gate");
  });
});
