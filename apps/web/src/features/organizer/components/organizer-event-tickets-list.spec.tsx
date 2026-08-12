import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrganizerEventTicketsList } from "@/features/organizer/components/organizer-event-tickets-list";

describe("OrganizerEventTicketsList", () => {
  it("shows empty state", () => {
    render(<OrganizerEventTicketsList items={[]} />);
    expect(
      screen.getByText("Ainda não há ingressos vendidos."),
    ).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<OrganizerEventTicketsList items={[]} loading />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("renders ticket rows with seat and status", () => {
    render(
      <OrganizerEventTicketsList
        items={[
          {
            id: "t1",
            code: "code-1",
            status: "VALID",
            seatLabel: "A1",
            sectorName: null,
            createdAt: "2026-08-01T12:00:00.000Z",
            validatedAt: null,
          },
          {
            id: "t2",
            code: "code-2",
            status: "USED",
            seatLabel: null,
            sectorName: "Pista",
            createdAt: "2026-08-01T12:00:00.000Z",
            validatedAt: "2026-08-02T20:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("Pista")).toBeInTheDocument();
    expect(screen.getByText("Válido")).toBeInTheDocument();
    expect(screen.getByText("Usado")).toBeInTheDocument();
    expect(screen.getByText(/Check-in/)).toBeInTheDocument();
  });
});
