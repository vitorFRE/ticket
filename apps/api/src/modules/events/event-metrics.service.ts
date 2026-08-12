import { Injectable, NotFoundException } from "@nestjs/common";
import {
  InventoryMode,
  ReservationStatus,
  SeatStatus,
  TicketStatus,
} from "../../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";

export type EventListMetrics = {
  capacity: number;
  occupancyPct: number;
  revenueCents: number;
  ticketsUsed: number;
  pendingHolds: number;
};

type ListEventBase = {
  id: string;
  inventoryMode: InventoryMode;
  priceCents: number;
  ticketsSold: number;
};

@Injectable()
export class EventMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async attachListMetrics<T extends ListEventBase>(
    events: T[],
  ): Promise<Array<T & EventListMetrics>> {
    if (events.length === 0) return [];

    const ids = events.map((event) => event.id);
    const now = new Date();

    const [seatCounts, sectorSums, usedCounts, pendingCounts, tickets] =
      await Promise.all([
        this.prisma.seat.groupBy({
          by: ["eventId"],
          where: { eventId: { in: ids } },
          _count: { _all: true },
        }),
        this.prisma.sector.groupBy({
          by: ["eventId"],
          where: { eventId: { in: ids } },
          _sum: { capacity: true },
        }),
        this.prisma.ticket.groupBy({
          by: ["eventId"],
          where: { eventId: { in: ids }, status: TicketStatus.USED },
          _count: { _all: true },
        }),
        this.prisma.reservation.groupBy({
          by: ["eventId"],
          where: {
            eventId: { in: ids },
            status: ReservationStatus.PENDING,
            expiresAt: { gt: now },
          },
          _count: { _all: true },
        }),
        this.prisma.ticket.findMany({
          where: {
            eventId: { in: ids },
            status: { not: TicketStatus.VOID },
          },
          select: {
            eventId: true,
            sector: { select: { priceCents: true } },
          },
        }),
      ]);

    const capacityByEvent = new Map<string, number>();
    for (const row of seatCounts) {
      capacityByEvent.set(row.eventId, row._count._all);
    }
    for (const row of sectorSums) {
      capacityByEvent.set(row.eventId, row._sum.capacity ?? 0);
    }

    const usedByEvent = new Map(
      usedCounts.map((row) => [row.eventId, row._count._all]),
    );
    const pendingByEvent = new Map(
      pendingCounts.map((row) => [row.eventId, row._count._all]),
    );

    const revenueByEvent = new Map<string, number>();
    const priceByEvent = new Map(events.map((e) => [e.id, e.priceCents]));
    for (const ticket of tickets) {
      const base = priceByEvent.get(ticket.eventId) ?? 0;
      const amount = ticket.sector?.priceCents ?? base;
      revenueByEvent.set(
        ticket.eventId,
        (revenueByEvent.get(ticket.eventId) ?? 0) + amount,
      );
    }

    return events.map((event) => {
      const capacity = capacityByEvent.get(event.id) ?? 0;
      const ticketsSold = event.ticketsSold;
      return {
        ...event,
        capacity,
        occupancyPct: capacity > 0 ? ticketsSold / capacity : 0,
        revenueCents: revenueByEvent.get(event.id) ?? 0,
        ticketsUsed: usedByEvent.get(event.id) ?? 0,
        pendingHolds: pendingByEvent.get(event.id) ?? 0,
      };
    });
  }

  async getEventStats(eventId: string, organizerId: string) {
    const event = await this.requireOwnedEvent(eventId, organizerId);

    const [ticketsSold, ticketsUsed, pendingHolds, tickets, voidCount] =
      await Promise.all([
        this.prisma.ticket.count({ where: { eventId } }),
        this.prisma.ticket.count({
          where: { eventId, status: TicketStatus.USED },
        }),
        this.prisma.reservation.count({
          where: {
            eventId,
            status: ReservationStatus.PENDING,
            expiresAt: { gt: new Date() },
          },
        }),
        this.prisma.ticket.findMany({
          where: { eventId, status: { not: TicketStatus.VOID } },
          select: {
            status: true,
            sectorId: true,
            sector: { select: { id: true, priceCents: true } },
          },
        }),
        this.prisma.ticket.count({
          where: { eventId, status: TicketStatus.VOID },
        }),
      ]);

    const validCount = tickets.filter(
      (ticket) => ticket.status === TicketStatus.VALID,
    ).length;
    const usedFromTickets = tickets.filter(
      (ticket) => ticket.status === TicketStatus.USED,
    ).length;

    let capacity = 0;
    let revenueCents = 0;
    let seats:
      | { available: number; held: number; sold: number }
      | undefined;
    let sectors:
      | Array<{
          id: string;
          name: string;
          capacity: number;
          availableCount: number;
          sold: number;
          revenueCents: number;
        }>
      | undefined;

    if (event.inventoryMode === InventoryMode.SEAT_MAP) {
      const [available, held, sold] = await Promise.all([
        this.prisma.seat.count({
          where: { eventId, status: SeatStatus.AVAILABLE },
        }),
        this.prisma.seat.count({
          where: { eventId, status: SeatStatus.HELD },
        }),
        this.prisma.seat.count({
          where: { eventId, status: SeatStatus.SOLD },
        }),
      ]);
      capacity = available + held + sold;
      seats = { available, held, sold };
      revenueCents = tickets.length * event.priceCents;
    } else {
      const sectorRows = await this.prisma.sector.findMany({
        where: { eventId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          capacity: true,
          availableCount: true,
          priceCents: true,
        },
      });
      capacity = sectorRows.reduce((sum, row) => sum + row.capacity, 0);
      const soldBySector = new Map<string, number>();
      const revenueBySector = new Map<string, number>();
      for (const ticket of tickets) {
        if (!ticket.sectorId) continue;
        soldBySector.set(
          ticket.sectorId,
          (soldBySector.get(ticket.sectorId) ?? 0) + 1,
        );
        const unit = ticket.sector?.priceCents ?? event.priceCents;
        revenueBySector.set(
          ticket.sectorId,
          (revenueBySector.get(ticket.sectorId) ?? 0) + unit,
        );
        revenueCents += unit;
      }
      sectors = sectorRows.map((row) => ({
        id: row.id,
        name: row.name,
        capacity: row.capacity,
        availableCount: row.availableCount,
        sold: soldBySector.get(row.id) ?? 0,
        revenueCents: revenueBySector.get(row.id) ?? 0,
      }));
    }

    return {
      eventId,
      ticketsSold,
      capacity,
      occupancyPct: capacity > 0 ? ticketsSold / capacity : 0,
      revenueCents,
      ticketsUsed,
      pendingHolds,
      byStatus: {
        valid: validCount,
        used: usedFromTickets,
        void: voidCount,
      },
      ...(seats ? { seats } : {}),
      ...(sectors ? { sectors } : {}),
    };
  }

  async listEventTickets(
    eventId: string,
    organizerId: string,
    limit = 50,
  ) {
    await this.requireOwnedEvent(eventId, organizerId);
    const take = Math.min(Math.max(limit, 1), 100);

    const tickets = await this.prisma.ticket.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        code: true,
        status: true,
        createdAt: true,
        validatedAt: true,
        seat: { select: { label: true } },
        sector: { select: { name: true } },
      },
    });

    return {
      items: tickets.map((ticket) => ({
        id: ticket.id,
        code: ticket.code,
        status: ticket.status,
        seatLabel: ticket.seat?.label ?? null,
        sectorName: ticket.sector?.name ?? null,
        createdAt: ticket.createdAt,
        validatedAt: ticket.validatedAt,
      })),
    };
  }

  private async requireOwnedEvent(eventId: string, organizerId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        organizerId: true,
        inventoryMode: true,
        priceCents: true,
      },
    });
    if (!event || event.organizerId !== organizerId) {
      throw new NotFoundException("Evento não encontrado");
    }
    return event;
  }
}
