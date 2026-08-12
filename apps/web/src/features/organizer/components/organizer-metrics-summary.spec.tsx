import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrganizerMetricsSummary } from "@/features/organizer/components/organizer-metrics-summary";

describe("OrganizerMetricsSummary", () => {
  it("renders the four summary metrics", () => {
    render(
      <OrganizerMetricsSummary
        publishedCount={3}
        ticketsSold={12}
        revenueCents={45000}
        ticketsUsed={4}
      />,
    );

    expect(screen.getByText("Publicados")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Vendidos")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Check-ins")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*450,00/)).toBeInTheDocument();
  });
});
