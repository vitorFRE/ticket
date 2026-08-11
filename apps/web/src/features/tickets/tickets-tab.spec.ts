import { describe, expect, it } from "vitest";
import { parseTicketsTab } from "@/features/tickets/tickets-tab";

describe("parseTicketsTab", () => {
  it("defaults to validos", () => {
    expect(parseTicketsTab(null)).toBe("validos");
    expect(parseTicketsTab("validos")).toBe("validos");
    expect(parseTicketsTab("outro")).toBe("validos");
  });

  it("accepts usados and pagamentos", () => {
    expect(parseTicketsTab("usados")).toBe("usados");
    expect(parseTicketsTab("pagamentos")).toBe("pagamentos");
  });
});
