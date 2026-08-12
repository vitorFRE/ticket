import {
  InventoryMode,
  TicketStatus,
} from "../../generated/prisma/enums";
import type { PrismaService } from "../prisma/prisma.service";
import { EventMetricsService } from "./event-metrics.service";

describe("EventMetricsService", () => {
  const prisma = {
    seat: { groupBy: jest.fn(), count: jest.fn() },
    sector: { groupBy: jest.fn(), findMany: jest.fn() },
    ticket: { groupBy: jest.fn(), count: jest.fn(), findMany: jest.fn() },
    reservation: { groupBy: jest.fn(), count: jest.fn() },
    event: { findUnique: jest.fn() },
  };

  let service: EventMetricsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EventMetricsService(prisma as unknown as PrismaService);
  });

  it("returns empty metrics for empty list without querying", async () => {
    const result = await service.attachListMetrics([]);
    expect(result).toEqual([]);
    expect(prisma.seat.groupBy).not.toHaveBeenCalled();
  });

  it("attaches seat-map capacity and pending holds", async () => {
    prisma.seat.groupBy.mockResolvedValue([
      { eventId: "evt-seat", _count: { _all: 120 } },
    ]);
    prisma.sector.groupBy.mockResolvedValue([]);
    prisma.ticket.groupBy.mockResolvedValue([]);
    prisma.reservation.groupBy.mockResolvedValue([
      { eventId: "evt-seat", _count: { _all: 3 } },
    ]);
    prisma.ticket.findMany.mockResolvedValue([
      { eventId: "evt-seat", sector: null },
      { eventId: "evt-seat", sector: null },
    ]);

    const result = await service.attachListMetrics([
      {
        id: "evt-seat",
        inventoryMode: InventoryMode.SEAT_MAP,
        priceCents: 3500,
        ticketsSold: 2,
      },
    ]);

    expect(result[0]).toMatchObject({
      capacity: 120,
      occupancyPct: 2 / 120,
      revenueCents: 7000,
      ticketsUsed: 0,
      pendingHolds: 3,
    });
  });

  it("attaches list metrics including GA sector revenue", async () => {
    prisma.seat.groupBy.mockResolvedValue([]);
    prisma.sector.groupBy.mockResolvedValue([
      { eventId: "evt-ga", _sum: { capacity: 100 } },
    ]);
    prisma.ticket.groupBy.mockResolvedValue([
      { eventId: "evt-ga", _count: { _all: 1 } },
    ]);
    prisma.reservation.groupBy.mockResolvedValue([]);
    prisma.ticket.findMany.mockResolvedValue([
      {
        eventId: "evt-ga",
        sector: { priceCents: 15000 },
      },
      {
        eventId: "evt-ga",
        sector: { priceCents: null },
      },
    ]);

    const result = await service.attachListMetrics([
      {
        id: "evt-ga",
        inventoryMode: InventoryMode.GA_SECTOR,
        priceCents: 8000,
        ticketsSold: 2,
      },
    ]);

    expect(result[0]).toMatchObject({
      capacity: 100,
      occupancyPct: 0.02,
      revenueCents: 23000,
      ticketsUsed: 1,
      pendingHolds: 0,
    });
  });

  it("uses zero occupancy when capacity is zero", async () => {
    prisma.seat.groupBy.mockResolvedValue([]);
    prisma.sector.groupBy.mockResolvedValue([]);
    prisma.ticket.groupBy.mockResolvedValue([]);
    prisma.reservation.groupBy.mockResolvedValue([]);
    prisma.ticket.findMany.mockResolvedValue([]);

    const result = await service.attachListMetrics([
      {
        id: "evt-empty",
        inventoryMode: InventoryMode.SEAT_MAP,
        priceCents: 1000,
        ticketsSold: 0,
      },
    ]);

    expect(result[0].occupancyPct).toBe(0);
    expect(result[0].capacity).toBe(0);
  });

  it("returns seat-map stats for owner", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-1",
      organizerId: "org-1",
      inventoryMode: InventoryMode.SEAT_MAP,
      priceCents: 3500,
    });
    prisma.ticket.count
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);
    prisma.reservation.count.mockResolvedValue(1);
    prisma.ticket.findMany.mockResolvedValue([
      { status: TicketStatus.VALID, sectorId: null, sector: null },
      { status: TicketStatus.USED, sectorId: null, sector: null },
    ]);
    prisma.seat.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(2);

    const stats = await service.getEventStats("evt-1", "org-1");
    expect(stats).toMatchObject({
      ticketsSold: 2,
      capacity: 14,
      revenueCents: 7000,
      ticketsUsed: 1,
      pendingHolds: 1,
      byStatus: { valid: 1, used: 1, void: 0 },
      seats: { available: 10, held: 2, sold: 2 },
    });
  });

  it("returns GA sector breakdown and sector prices", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-ga",
      organizerId: "org-1",
      inventoryMode: InventoryMode.GA_SECTOR,
      priceCents: 8000,
    });
    prisma.ticket.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);
    prisma.reservation.count.mockResolvedValue(0);
    prisma.ticket.findMany.mockResolvedValue([
      {
        status: TicketStatus.VALID,
        sectorId: "s-pista",
        sector: { id: "s-pista", priceCents: null },
      },
      {
        status: TicketStatus.VALID,
        sectorId: "s-cam",
        sector: { id: "s-cam", priceCents: 15000 },
      },
      {
        status: TicketStatus.USED,
        sectorId: "s-cam",
        sector: { id: "s-cam", priceCents: 15000 },
      },
    ]);
    prisma.sector.findMany.mockResolvedValue([
      {
        id: "s-pista",
        name: "Pista",
        capacity: 100,
        availableCount: 99,
        priceCents: null,
      },
      {
        id: "s-cam",
        name: "Camarote",
        capacity: 20,
        availableCount: 18,
        priceCents: 15000,
      },
    ]);

    const stats = await service.getEventStats("evt-ga", "org-1");
    expect(stats.capacity).toBe(120);
    expect(stats.revenueCents).toBe(8000 + 15000 + 15000);
    expect(stats.sectors).toEqual([
      expect.objectContaining({
        id: "s-pista",
        name: "Pista",
        sold: 1,
        revenueCents: 8000,
      }),
      expect.objectContaining({
        id: "s-cam",
        name: "Camarote",
        sold: 2,
        revenueCents: 30000,
      }),
    ]);
  });

  it("lists tickets only for owner", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-1",
      organizerId: "org-1",
      inventoryMode: InventoryMode.SEAT_MAP,
      priceCents: 3500,
    });
    prisma.ticket.findMany.mockResolvedValue([
      {
        id: "t1",
        code: "abc",
        status: TicketStatus.VALID,
        createdAt: new Date("2026-01-01"),
        validatedAt: null,
        seat: { label: "A1" },
        sector: null,
      },
    ]);

    const result = await service.listEventTickets("evt-1", "org-1", 50);
    expect(result.items).toEqual([
      expect.objectContaining({
        id: "t1",
        code: "abc",
        seatLabel: "A1",
        sectorName: null,
      }),
    ]);
  });

  it("clamps ticket list limit between 1 and 100", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-1",
      organizerId: "org-1",
      inventoryMode: InventoryMode.SEAT_MAP,
      priceCents: 3500,
    });
    prisma.ticket.findMany.mockResolvedValue([]);

    await service.listEventTickets("evt-1", "org-1", 0);
    expect(prisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1 }),
    );

    await service.listEventTickets("evt-1", "org-1", 500);
    expect(prisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it("404s stats for non-owner", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-1",
      organizerId: "org-1",
      inventoryMode: InventoryMode.SEAT_MAP,
      priceCents: 3500,
    });
    await expect(service.getEventStats("evt-1", "other")).rejects.toMatchObject(
      { status: 404 },
    );
  });

  it("404s tickets when event is missing", async () => {
    prisma.event.findUnique.mockResolvedValue(null);
    await expect(
      service.listEventTickets("missing", "org-1"),
    ).rejects.toMatchObject({ status: 404 });
  });
});
