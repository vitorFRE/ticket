import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TicketsTabNav } from "@/features/tickets/components/tickets-tab-nav";

describe("TicketsTabNav", () => {
  it("renders the three tabs and reports the active one", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TicketsTabNav
        value="validos"
        counts={{ validos: 2, usados: 1, pagamentos: 3 }}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("button", { name: /Válidos/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Usados/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      screen.getByRole("button", { name: /Pagamentos/ }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Pagamentos/ }));
    expect(onChange).toHaveBeenCalledWith("pagamentos");
  });
});
