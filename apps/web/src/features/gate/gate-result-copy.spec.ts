import { describe, expect, it } from "vitest";
import {
  gatePlace,
  gateResultCopy,
  gateResultTone,
} from "@/features/gate/gate-result-copy";
import { makeGateTicket } from "@/test/fixtures";

describe("gate-result-copy", () => {
  it("picks seat or sector as the place", () => {
    expect(gatePlace(null)).toBeNull();
    expect(gatePlace(makeGateTicket())).toBe("A1");
    expect(
      gatePlace(makeGateTicket({ seat: null, sector: { name: "Pista" } })),
    ).toBe("Pista");
  });

  it("maps result to tone and copy", () => {
    expect(gateResultTone("VALID")).toBe("ok");
    expect(gateResultCopy("VALID")).toEqual({
      title: "Pode entrar",
      body: "Liberar a passagem.",
    });
    expect(gateResultTone("ALREADY_USED")).toBe("used");
    expect(gateResultCopy("ALREADY_USED").title).toBe("Já usado");
    expect(gateResultTone("WRONG_EVENT")).toBe("wrong");
    expect(gateResultCopy("WRONG_EVENT").title).toBe("Evento errado");
    expect(gateResultTone("INVALID")).toBe("invalid");
    expect(gateResultCopy("INVALID").title).toBe("Ingresso inválido");
    expect(gateResultTone("GATE_CLOSED")).toBe("closed");
    expect(gateResultCopy("GATE_CLOSED", 2)).toEqual({
      title: "Ainda não abriu",
      body: "A portaria libera 2 horas antes do início.",
    });
  });
});
