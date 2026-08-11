import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GateResult } from "@/features/gate/components/gate-result";
import { makeGateTicket } from "@/test/fixtures";

describe("GateResult", () => {
  it("uses the result as the title when there is a seat", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(
      <GateResult
        data={{ result: "VALID", ticket: makeGateTicket() }}
        onNext={onNext}
      />,
    );

    expect(screen.getByText("Pode entrar")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A1" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(onNext).toHaveBeenCalled();
  });

  it("uses Já usado as the title when the ticket has no place", () => {
    render(
      <GateResult
        data={{
          result: "ALREADY_USED",
          ticket: makeGateTicket({
            seat: null,
            sector: null,
            status: "USED",
            validatedAt: "2026-08-01T20:00:00.000Z",
          }),
        }}
        onNext={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /Já usado/ }),
    ).toBeInTheDocument();
  });
});
