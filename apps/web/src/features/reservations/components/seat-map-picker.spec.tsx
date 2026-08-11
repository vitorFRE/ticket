import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SeatMapPicker } from "@/features/reservations/components/seat-map-picker";
import { makeSeat } from "@/test/fixtures";

const seats = [
  makeSeat({ id: "a1", label: "A1", number: 1 }),
  makeSeat({ id: "a2", label: "A2", number: 2, status: "SOLD" }),
  makeSeat({ id: "a3", label: "A3", number: 3, status: "HELD" }),
];

describe("SeatMapPicker", () => {
  it("lets the client pick a free seat and confirm", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onConfirm = vi.fn();
    render(
      <SeatMapPicker
        seats={seats}
        selectedIds={["a1"]}
        onToggle={onToggle}
        priceCents={3200}
        submitting={false}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "A1" }));
    expect(onToggle).toHaveBeenCalledWith(seats[0]);
    expect(screen.getByRole("button", { name: "A2" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Confirmar reserva" }),
    ).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Confirmar reserva" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("locks the map on a pending hold and shows Pagar agora", () => {
    render(
      <SeatMapPicker
        seats={seats}
        selectedIds={[]}
        heldIds={["a3"]}
        onToggle={vi.fn()}
        priceCents={3200}
        submitting={false}
        onConfirm={vi.fn()}
        lockedHold={{
          payHref: "/reservations/res-1/pay",
          labels: "A3",
          totalCents: 3200,
        }}
      />,
    );

    expect(screen.getByText("Seu hold")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Confirmar reserva" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pagar agora" })).toHaveAttribute(
      "href",
      "/reservations/res-1/pay",
    );
    expect(screen.getByRole("button", { name: "A1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "A3" })).toBeDisabled();
  });

  it("does not treat a sold seat as Seu hold", () => {
    render(
      <SeatMapPicker
        seats={seats}
        selectedIds={[]}
        onToggle={vi.fn()}
        priceCents={3200}
        submitting={false}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.queryByText("Seu hold")).not.toBeInTheDocument();
    expect(screen.getByText("Ocupado")).toBeInTheDocument();
  });
});
