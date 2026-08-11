import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import {
  EventStatus,
  InventoryMode,
  ReservationStatus,
  SeatStatus,
} from "../../generated/prisma/enums";
import type { PrismaService } from "../prisma/prisma.service";
import type { TicketsService } from "../tickets/tickets.service";
import { PayOutcome } from "./dto/pay-reservation.dto";
import { HOLD_TTL_MS, ReservationsService } from "./reservations.service";

describe("ReservationsService", () => {
  const prisma = {
    event: { findUnique: jest.fn() },
    seat: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    sector: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    reservation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const ticketsService = {
    createTicketsForReservation: jest.fn(),
  };

  let service: ReservationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.reservation.findMany.mockResolvedValue([]);
    prisma.$transaction.mockImplementation(
      async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
    );
    service = new ReservationsService(
      prisma as unknown as PrismaService,
      ticketsService as unknown as TicketsService,
    );
  });

  it("creates SEAT_MAP reservation and holds seats", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-1",
      status: EventStatus.PUBLISHED,
      inventoryMode: InventoryMode.SEAT_MAP,
    });
    prisma.seat.findMany.mockResolvedValue([{ id: "s1" }, { id: "s2" }]);
    prisma.seat.updateMany.mockResolvedValue({ count: 2 });
    const created = {
      id: "r1",
      status: ReservationStatus.PENDING,
      items: [],
    };
    prisma.reservation.create.mockResolvedValue(created);

    const result = await service.create("user-1", {
      eventId: "evt-1",
      seatIds: ["s1", "s2"],
    });

    expect(prisma.seat.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["s1", "s2"] },
        eventId: "evt-1",
        status: SeatStatus.AVAILABLE,
      },
      data: { status: SeatStatus.HELD },
    });
    expect(prisma.reservation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          status: ReservationStatus.PENDING,
          expiresAt: expect.any(Date),
        }),
      }),
    );
    const expiresAt = prisma.reservation.create.mock.calls[0][0].data
      .expiresAt as Date;
    expect(expiresAt.getTime()).toBeGreaterThan(
      Date.now() + HOLD_TTL_MS - 5000,
    );
    expect(result).toEqual(created);
  });

  it("creates GA_SECTOR reservation and decrements availableCount", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-2",
      status: EventStatus.PUBLISHED,
      inventoryMode: InventoryMode.GA_SECTOR,
    });
    prisma.sector.findFirst.mockResolvedValue({ id: "sec-1" });
    prisma.sector.updateMany.mockResolvedValue({ count: 1 });
    prisma.reservation.create.mockResolvedValue({ id: "r2" });

    await service.create("user-1", {
      eventId: "evt-2",
      sectorId: "sec-1",
      quantity: 3,
    });

    expect(prisma.sector.updateMany).toHaveBeenCalledWith({
      where: {
        id: "sec-1",
        eventId: "evt-2",
        availableCount: { gte: 3 },
      },
      data: { availableCount: { decrement: 3 } },
    });
  });

  it("returns 409 when seats are not available", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-1",
      status: EventStatus.PUBLISHED,
      inventoryMode: InventoryMode.SEAT_MAP,
    });
    prisma.seat.findMany.mockResolvedValue([{ id: "s1" }]);
    prisma.seat.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.create("user-1", { eventId: "evt-1", seatIds: ["s1"] }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("returns 409 when sector capacity is insufficient", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-2",
      status: EventStatus.PUBLISHED,
      inventoryMode: InventoryMode.GA_SECTOR,
    });
    prisma.sector.findFirst.mockResolvedValue({ id: "sec-1" });
    prisma.sector.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.create("user-1", {
        eventId: "evt-2",
        sectorId: "sec-1",
        quantity: 50,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects mixed or empty inventory payload", async () => {
    await expect(
      service.create("user-1", { eventId: "evt-1" }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.create("user-1", {
        eventId: "evt-1",
        seatIds: ["s1"],
        sectorId: "sec-1",
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("expires overdue reservations and releases inventory", async () => {
    prisma.reservation.findMany.mockResolvedValue([
      {
        id: "r-old",
        items: [
          { seatId: "s1", sectorId: null, quantity: null },
          { seatId: null, sectorId: "sec-1", quantity: 2 },
        ],
      },
    ]);

    const count = await service.expireOverdueReservations();

    expect(count).toBe(1);
    expect(prisma.seat.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["s1"] }, status: SeatStatus.HELD },
      data: { status: SeatStatus.AVAILABLE },
    });
    expect(prisma.sector.update).toHaveBeenCalledWith({
      where: { id: "sec-1" },
      data: { availableCount: { increment: 2 } },
    });
    expect(prisma.reservation.update).toHaveBeenCalledWith({
      where: { id: "r-old" },
      data: { status: ReservationStatus.EXPIRED },
    });
  });

  it("lists mine after expiring", async () => {
    const expireSpy = jest.spyOn(service, "expireOverdueReservations");
    prisma.reservation.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "r1" }]);

    const result = await service.listMine("user-1");

    expect(expireSpy).toHaveBeenCalled();
    expect(result.items).toEqual([{ id: "r1" }]);
  });

  it("returns 404 for another user reservation", async () => {
    prisma.reservation.findUnique.mockResolvedValue({
      id: "r1",
      userId: "other",
    });

    await expect(service.getById("r1", "user-1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("rejects unpublished event", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-1",
      status: EventStatus.DRAFT,
      inventoryMode: InventoryMode.SEAT_MAP,
    });

    await expect(
      service.create("user-1", { eventId: "evt-1", seatIds: ["s1"] }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("approves payment, sells seats and creates tickets", async () => {
    prisma.reservation.findMany.mockResolvedValue([]);
    prisma.reservation.findUnique.mockResolvedValue({
      id: "r1",
      userId: "user-1",
      eventId: "evt-1",
      status: ReservationStatus.PENDING,
      payment: null,
      items: [{ seatId: "s1", sectorId: null, quantity: null }],
    });
    prisma.seat.updateMany.mockResolvedValue({ count: 1 });
    prisma.reservation.findUniqueOrThrow.mockResolvedValue({
      id: "r1",
      status: ReservationStatus.PAID,
      tickets: [{ id: "t1" }],
    });
    ticketsService.createTicketsForReservation.mockResolvedValue([
      { id: "t1" },
    ]);

    const result = await service.pay("r1", "user-1", {
      outcome: PayOutcome.APPROVED,
    });

    expect(prisma.seat.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["s1"] }, status: SeatStatus.HELD },
      data: { status: SeatStatus.SOLD },
    });
    expect(prisma.payment.create).toHaveBeenCalled();
    expect(ticketsService.createTicketsForReservation).toHaveBeenCalled();
    expect(result.status).toBe(ReservationStatus.PAID);
  });

  it("rejects payment and releases hold", async () => {
    prisma.reservation.findMany.mockResolvedValue([]);
    prisma.reservation.findUnique.mockResolvedValue({
      id: "r1",
      userId: "user-1",
      eventId: "evt-1",
      status: ReservationStatus.PENDING,
      payment: null,
      items: [
        { seatId: "s1", sectorId: null, quantity: null },
        { seatId: null, sectorId: "sec-1", quantity: 2 },
      ],
    });
    prisma.reservation.findUniqueOrThrow.mockResolvedValue({
      id: "r1",
      status: ReservationStatus.FAILED,
      tickets: [],
    });

    const result = await service.pay("r1", "user-1", {
      outcome: PayOutcome.REJECTED,
    });

    expect(prisma.seat.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["s1"] }, status: SeatStatus.HELD },
      data: { status: SeatStatus.AVAILABLE },
    });
    expect(prisma.sector.update).toHaveBeenCalledWith({
      where: { id: "sec-1" },
      data: { availableCount: { increment: 2 } },
    });
    expect(ticketsService.createTicketsForReservation).not.toHaveBeenCalled();
    expect(result.status).toBe(ReservationStatus.FAILED);
  });

  it("rejects pay for non-pending reservation", async () => {
    prisma.reservation.findMany.mockResolvedValue([]);
    prisma.reservation.findUnique.mockResolvedValue({
      id: "r1",
      userId: "user-1",
      status: ReservationStatus.PAID,
      payment: { id: "p1" },
      items: [],
    });

    await expect(
      service.pay("r1", "user-1", { outcome: PayOutcome.APPROVED }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
