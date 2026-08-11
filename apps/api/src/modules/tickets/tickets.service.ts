import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Prisma } from "../../generated/prisma/client";
import { TicketStatus } from "../../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { TicketQrService } from "./ticket-qr.service";

const ticketInclude = {
  seat: {
    select: { id: true, label: true, row: true, number: true },
  },
  sector: {
    select: { id: true, name: true },
  },
  event: {
    select: {
      id: true,
      title: true,
      venue: true,
      startsAt: true,
      priceCents: true,
      imageUrl: true,
    },
  },
  share: {
    select: { publicToken: true, createdAt: true },
  },
} satisfies Prisma.TicketInclude;

export type TicketDraftInput = {
  reservationId: string;
  userId: string;
  eventId: string;
  seatId?: string | null;
  sectorId?: string | null;
};

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qr: TicketQrService,
    private readonly config: ConfigService,
  ) {}

  async createTicketsForReservation(
    tx: Prisma.TransactionClient,
    drafts: TicketDraftInput[],
  ) {
    const tickets = [];
    for (const draft of drafts) {
      const id = randomUUID();
      const code = this.qr.createCode();
      const qrPayload = this.qr.buildPayload({
        code,
        eventId: draft.eventId,
        ticketId: id,
      });

      const ticket = await tx.ticket.create({
        data: {
          id,
          reservationId: draft.reservationId,
          userId: draft.userId,
          eventId: draft.eventId,
          code,
          qrPayload,
          status: TicketStatus.VALID,
          seatId: draft.seatId ?? null,
          sectorId: draft.sectorId ?? null,
        },
        include: ticketInclude,
      });
      tickets.push(ticket);
    }
    return tickets;
  }

  async listMine(userId: string) {
    const items = await this.prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: ticketInclude,
    });
    return { items };
  }

  async getById(id: string, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: ticketInclude,
    });
    if (!ticket || ticket.userId !== userId) {
      throw new NotFoundException("Ingresso não encontrado");
    }
    return ticket;
  }

  async share(id: string, userId: string) {
    const ticket = await this.getById(id, userId);

    let share = await this.prisma.ticketShare.findUnique({
      where: { ticketId: ticket.id },
    });

    if (!share) {
      share = await this.prisma.ticketShare.create({
        data: {
          ticketId: ticket.id,
          publicToken: this.qr.createShareToken(),
        },
      });
    }

    const frontendUrl = (
      this.config.get<string>("frontendUrl") ?? "http://localhost:3000"
    ).replace(/\/$/, "");

    return {
      token: share.publicToken,
      url: `${frontendUrl}/t/${share.publicToken}`,
    };
  }

  async getPublicByToken(token: string) {
    const share = await this.prisma.ticketShare.findUnique({
      where: { publicToken: token },
      include: {
        ticket: {
          include: ticketInclude,
        },
      },
    });

    if (!share) {
      throw new NotFoundException("Link de ingresso não encontrado");
    }

    const { ticket } = share;
    return {
      code: ticket.code,
      status: ticket.status,
      event: ticket.event,
      seat: ticket.seat,
      sector: ticket.sector,
    };
  }
}
