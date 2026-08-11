import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SectorPicker } from "@/features/reservations/components/sector-picker";
import { makeSector } from "@/test/fixtures";

const sectors = [
  makeSector({ id: "pista", name: "Pista", priceCents: 9000 }),
  makeSector({ id: "camarote", name: "Camarote", priceCents: 16000 }),
];

describe("SectorPicker", () => {
  it("keeps quantity inside the selected sector row", () => {
    render(
      <SectorPicker
        sectors={sectors}
        selectedId="camarote"
        quantity={2}
        onSelect={vi.fn()}
        onQuantity={vi.fn()}
        submitting={false}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText("Quantidade neste setor")).toBeInTheDocument();
    expect(screen.getByText("Camarote x 2")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Diminuir Pista" }),
    ).not.toBeInTheDocument();
  });

  it("calls onSelect and onQuantity", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onQuantity = vi.fn();
    render(
      <SectorPicker
        sectors={sectors}
        selectedId="camarote"
        quantity={1}
        onSelect={onSelect}
        onQuantity={onQuantity}
        submitting={false}
        onConfirm={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Pista/ }));
    expect(onSelect).toHaveBeenCalledWith(sectors[0]);
    await user.click(screen.getByRole("button", { name: "Aumentar Camarote" }));
    expect(onQuantity).toHaveBeenCalledWith(2);
  });

  it("replaces confirm with Pagar agora when there is a hold", () => {
    render(
      <SectorPicker
        sectors={sectors}
        selectedId="camarote"
        quantity={2}
        onSelect={vi.fn()}
        onQuantity={vi.fn()}
        submitting={false}
        onConfirm={vi.fn()}
        lockedHold={{
          payHref: "/reservations/res-2/pay",
          labels: "Camarote x 2",
          totalCents: 32000,
        }}
      />,
    );

    expect(
      screen.queryByText("Quantidade neste setor"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Confirmar reserva" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pagar agora" })).toHaveAttribute(
      "href",
      "/reservations/res-2/pay",
    );
    expect(screen.getByRole("button", { name: /Pista/ })).toBeDisabled();
  });
});
