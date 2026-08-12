import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OrganizerListStatusFilter } from "@/features/organizer/components/organizer-list-status-filter";

describe("OrganizerListStatusFilter", () => {
  it("marks the active chip and reports changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OrganizerListStatusFilter value="all" onChange={onChange} />);

    expect(screen.getByRole("button", { name: "Todos" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "Próximos" }));
    expect(onChange).toHaveBeenCalledWith("upcoming");
  });
});
