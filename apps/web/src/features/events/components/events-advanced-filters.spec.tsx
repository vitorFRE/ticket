import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EventsAdvancedFilters } from "@/features/events/components/events-advanced-filters";

describe("EventsAdvancedFilters", () => {
  it("toggles the panel and clears active filters", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <EventsAdvancedFilters
        value={{ venue: "Arena", priceMin: 1000 }}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("(2)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Arena, Cinemark/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Limpar/ }));
    expect(onChange).toHaveBeenCalledWith({});
  });

  it("updates date filters when changed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EventsAdvancedFilters value={{}} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /^Filtros$/ }));
    const from = screen.getByLabelText("De");
    await user.clear(from);
    await user.type(from, "2026-09-01");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ from: "2026-09-01" }),
    );
  });

  it("applies price on blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EventsAdvancedFilters value={{}} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /^Filtros$/ }));
    const min = screen.getByLabelText("Preço mín. (R$)");
    await user.type(min, "35,50");
    await user.tab();
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ priceMin: 3550 }),
    );
  });
});
