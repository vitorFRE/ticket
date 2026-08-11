import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReservationPayContent } from "@/features/reservations/components/reservation-pay-content";
import { makeReservation } from "@/test/fixtures";

const pending = makeReservation();

describe("ReservationPayContent", () => {
  it("shows the locked test card and pay actions while pending", async () => {
    const user = userEvent.setup();
    const onPay = vi.fn();
    render(
      <ReservationPayContent
        reservation={pending}
        imageUrl={null}
        remainingMs={14 * 60_000}
        expiredByClock={false}
        canPay
        rejected={false}
        submitting={null}
        payError={null}
        onPay={onPay}
        holderName="Cliente Um"
      />,
    );

    expect(screen.getByText("14:00")).toBeInTheDocument();
    expect(
      screen.getByText("Se não pagar, esses lugares voltam à lista."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Cartão de simulação")).toBeDisabled();
    expect(screen.getByDisplayValue("4242 4242 4242 4242")).toBeInTheDocument();
    expect(
      screen.getByText("Cartão de teste. Nada é cobrado."),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Confirmar pagamento" }),
    );
    expect(onPay).toHaveBeenCalledWith("APPROVED");
    await user.click(screen.getByRole("button", { name: "Simular rejeição" }));
    expect(onPay).toHaveBeenCalledWith("REJECTED");
  });

  it("turns a rejection into the page title", () => {
    render(
      <ReservationPayContent
        reservation={pending}
        imageUrl={null}
        remainingMs={0}
        expiredByClock={false}
        canPay={false}
        rejected
        submitting={null}
        payError={null}
        onPay={vi.fn()}
        holderName="Cliente Um"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Pagamento recusado" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/voltaram à lista. Ninguém foi cobrado/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Escolher de novo" }),
    ).toHaveAttribute("href", "/events/evt-1");
    expect(
      screen.queryByRole("button", { name: "Confirmar pagamento" }),
    ).not.toBeInTheDocument();
  });

  it("turns an expired hold into the page title", () => {
    render(
      <ReservationPayContent
        reservation={makeReservation({ status: "EXPIRED" })}
        imageUrl={null}
        remainingMs={0}
        expiredByClock
        canPay={false}
        rejected={false}
        submitting={null}
        payError={null}
        onPay={vi.fn()}
        holderName="Cliente Um"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "A reserva expirou" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Escolher de novo" }),
    ).toBeInTheDocument();
  });
});
