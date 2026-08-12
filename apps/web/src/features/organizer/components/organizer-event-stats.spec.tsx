import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrganizerEventStats } from "@/features/organizer/components/organizer-event-stats";
import type { EventStats } from "@/features/organizer/types";

const baseStats: EventStats = {
  eventId: "evt-1",
  ticketsSold: 10,
  capacity: 100,
  occupancyPct: 0.1,
  revenueCents: 35000,
  ticketsUsed: 3,
  pendingHolds: 0,
  byStatus: { valid: 7, used: 3, void: 0 },
};

describe("OrganizerEventStats", () => {
  it("renders core metrics", () => {
    render(<OrganizerEventStats stats={baseStats} />);
    expect(screen.getByText("Vendidos")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*350,00/)).toBeInTheDocument();
  });

  it("shows pending holds and seat breakdown", () => {
    render(
      <OrganizerEventStats
        stats={{
          ...baseStats,
          pendingHolds: 2,
          seats: { available: 80, held: 10, sold: 10 },
        }}
      />,
    );
    expect(screen.getByText("2 holds pendentes")).toBeInTheDocument();
    expect(screen.getByText(/80 livres/)).toBeInTheDocument();
  });

  it("lists sector rows for GA events", () => {
    render(
      <OrganizerEventStats
        stats={{
          ...baseStats,
          sectors: [
            {
              id: "s1",
              name: "Pista",
              capacity: 100,
              availableCount: 90,
              sold: 10,
              revenueCents: 80000,
            },
          ],
        }}
      />,
    );
    expect(screen.getByText("Pista")).toBeInTheDocument();
    expect(screen.getByText(/10\/100/)).toBeInTheDocument();
  });
});
