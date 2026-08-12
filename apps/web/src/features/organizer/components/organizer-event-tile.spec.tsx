import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OrganizerEventTile } from "@/features/organizer/components/organizer-event-tile";
import type { EventListItem } from "@/features/events/types";

const baseEvent: EventListItem = {
  id: "evt-1",
  title: "Interestelar",
  description: null,
  venue: "Cinema X",
  startsAt: "2026-09-01T20:00:00.000Z",
  gateOpensHoursBefore: null,
  priceCents: 3500,
  status: "PUBLISHED",
  inventoryMode: "SEAT_MAP",
  externalSource: "TMDB",
  externalId: "1",
  imageUrl: null,
  organizerId: "org-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ticketsSold: 4,
  occupancyPct: 0.25,
  revenueCents: 14000,
};

describe("OrganizerEventTile", () => {
  it("shows sold occupancy and revenue", () => {
    render(
      <OrganizerEventTile
        event={baseEvent}
        publishing={false}
        onPublish={vi.fn()}
      />,
    );
    expect(screen.getByText("Interestelar")).toBeInTheDocument();
    expect(screen.getByText(/4 vendidos/)).toBeInTheDocument();
    expect(screen.getByText(/25%/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*140,00/)).toBeInTheDocument();
  });

  it("publishes drafts from the tile action", async () => {
    const user = userEvent.setup();
    const onPublish = vi.fn();
    render(
      <OrganizerEventTile
        event={{ ...baseEvent, status: "DRAFT" }}
        publishing={false}
        onPublish={onPublish}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Publicar" }));
    expect(onPublish).toHaveBeenCalledWith("evt-1");
  });
});
