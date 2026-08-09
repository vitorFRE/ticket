import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "../../generated/prisma/client";
import {
  EventStatus,
  InventoryMode,
  ReservationStatus,
  SeatStatus,
} from "../../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateReservationDto } from "./dto/create-reservation.dto";

export const HOLD_TTL_MS = 15 * 60 * 1000;

const reservationInclude = {
  items: {
    include: {
      seat: {
        select: {
          id: true,
          label: true,
          row: true,
          number: true,
          status: true,
        },
      },
      sector: {
        select: {
          id: true,
          name: true,
          capacity: true,
          availableCount: true,
          priceCents: true,
        },
      },
    },
  },
  event: {
    select: {
      id: true,
      title: true,
      venue: true,
      startsAt: true,
      priceCents: true,
      inventoryMode: true,
      status: true,
    },
  },
} satisfies Prisma.ReservationInclude;

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReservationDto) {
    await this.expireOverdueReservations();

    const hasSeats = !!dto.seatIds?.length;
    const hasSector = !!dto.sectorId;

    if (hasSeats === hasSector) {
      throw new BadRequestException(
        "Informe seatIds (SEAT_MAP) ou sectorId+quantity (GA_SECTOR)",
      );
    }
    if (hasSector && (dto.quantity === undefined || dto.quantity < 1)) {
      throw new BadRequestException("quantity é obrigatório e deve ser >= 1");
    }

    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      select: {
        id: true,
        status: true,
        inventoryMode: true,
      },
    });

    if (!event || event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException("Evento não encontrado");
    }

    if (hasSeats && event.inventoryMode !== InventoryMode.SEAT_MAP) {
      throw new BadRequestException("Evento não usa mapa de assentos");
    }
    if (hasSector && event.inventoryMode !== InventoryMode.GA_SECTOR) {
      throw new BadRequestException("Evento não usa setores GA");
    }

    const expiresAt = new Date(Date.now() + HOLD_TTL_MS);

    if (hasSeats) {
      const seatIds = dto.seatIds ?? [];
      return this.createSeatReservation(
        userId,
        dto.eventId,
        [...new Set(seatIds)],
        expiresAt,
      );
    }

    const sectorId = dto.sectorId;
    const quantity = dto.quantity;
    if (!sectorId || quantity === undefined) {
      throw new BadRequestException(
        "Informe seatIds (SEAT_MAP) ou sectorId+quantity (GA_SECTOR)",
      );
    }

    return this.createSectorReservation(
      userId,
      dto.eventId,
      sectorId,
      quantity,
      expiresAt,
    );
  }

  async listMine(userId: string) {
    await this.expireOverdueReservations();

    const items = await this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: reservationInclude,
    });

    return { items };
  }

  async getById(id: string, userId: string) {
    await this.expireOverdueReservations();

    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: reservationInclude,
    });

    if (!reservation || reservation.userId !== userId) {
      throw new NotFoundException("Reserva não encontrada");
    }

    return reservation;
  }

  async expireOverdueReservations(): Promise<number> {
    const now = new Date();
    const overdue = await this.prisma.reservation.findMany({
      where: {
        status: ReservationStatus.PENDING,
        expiresAt: { lt: now },
      },
      include: {
        items: {
          select: {
            seatId: true,
            sectorId: true,
            quantity: true,
          },
        },
      },
    });

    if (overdue.length === 0) {
      return 0;
    }

    await this.prisma.$transaction(async (tx) => {
      for (const reservation of overdue) {
        const seatIds = reservation.items
          .map((item) => item.seatId)
          .filter((id): id is string => !!id);

        if (seatIds.length > 0) {
          await tx.seat.updateMany({
            where: {
              id: { in: seatIds },
              status: SeatStatus.HELD,
            },
            data: { status: SeatStatus.AVAILABLE },
          });
        }

        for (const item of reservation.items) {
          if (item.sectorId && item.quantity) {
            await tx.sector.update({
              where: { id: item.sectorId },
              data: { availableCount: { increment: item.quantity } },
            });
          }
        }

        await tx.reservation.update({
          where: { id: reservation.id },
          data: { status: ReservationStatus.EXPIRED },
        });
      }
    });

    return overdue.length;
  }

  private async createSeatReservation(
    userId: string,
    eventId: string,
    seatIds: string[],
    expiresAt: Date,
  ) {
    const seats = await this.prisma.seat.findMany({
      where: { id: { in: seatIds }, eventId },
      select: { id: true },
    });

    if (seats.length !== seatIds.length) {
      throw new NotFoundException(
        "Um ou mais assentos não pertencem a este evento",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const held = await tx.seat.updateMany({
        where: {
          id: { in: seatIds },
          eventId,
          status: SeatStatus.AVAILABLE,
        },
        data: { status: SeatStatus.HELD },
      });

      if (held.count !== seatIds.length) {
        throw new ConflictException(
          "Um ou mais assentos não estão disponíveis",
        );
      }

      return tx.reservation.create({
        data: {
          eventId,
          userId,
          status: ReservationStatus.PENDING,
          expiresAt,
          items: {
            create: seatIds.map((seatId) => ({ seatId })),
          },
        },
        include: reservationInclude,
      });
    });
  }

  private async createSectorReservation(
    userId: string,
    eventId: string,
    sectorId: string,
    quantity: number,
    expiresAt: Date,
  ) {
    const sector = await this.prisma.sector.findFirst({
      where: { id: sectorId, eventId },
      select: { id: true },
    });

    if (!sector) {
      throw new NotFoundException("Setor não pertence a este evento");
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.sector.updateMany({
        where: {
          id: sectorId,
          eventId,
          availableCount: { gte: quantity },
        },
        data: { availableCount: { decrement: quantity } },
      });

      if (updated.count !== 1) {
        throw new ConflictException("Capacidade insuficiente no setor");
      }

      return tx.reservation.create({
        data: {
          eventId,
          userId,
          status: ReservationStatus.PENDING,
          expiresAt,
          items: {
            create: [{ sectorId, quantity }],
          },
        },
        include: reservationInclude,
      });
    });
  }
}
