import { Injectable } from "@nestjs/common";
import type { Prisma } from "../../generated/prisma/client";
import { TicketStatus } from "../../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { TicketQrService } from "../tickets/ticket-qr.service";

export type GateValidateResult =
  | "VALID"
  | "INVALID"
  | "ALREADY_USED"
  | "WRONG_EVENT";

const gateTicketSelect = {
  id: true,
  code: true,
  status: true,
  eventId: true,
  validatedAt: true,
  seat: { select: { label: true } },
  sector: { select: { name: true } },
  user: { select: { name: true } },
  event: { select: { id: true, title: true } },
} satisfies Prisma.TicketSelect;

type GateTicketRow = Prisma.TicketGetPayload<{ select: typeof gateTicketSelect }>;

@Injectable()
export class GateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qr: TicketQrService,
  ) {}

  async validate(eventId: string, code: string, gateUserId: string) {
    const ticket = await this.resolveTicket(code);
    if (!ticket) {
      return this.response("INVALID", null);
    }

    if (ticket.status === TicketStatus.VOID) {
      return this.response("INVALID", null);
    }

    if (ticket.eventId !== eventId) {
      return this.response("WRONG_EVENT", ticket);
    }

    if (ticket.status === TicketStatus.USED) {
      return this.response("ALREADY_USED", ticket);
    }

    const now = new Date();
    const updated = await this.prisma.ticket.updateMany({
      where: { id: ticket.id, status: TicketStatus.VALID },
      data: {
        status: TicketStatus.USED,
        validatedAt: now,
        validatedById: gateUserId,
      },
    });

    if (updated.count === 0) {
      const again = await this.prisma.ticket.findUnique({
        where: { id: ticket.id },
        select: gateTicketSelect,
      });
      if (!again || again.status === TicketStatus.VOID) {
        return this.response("INVALID", null);
      }
      return this.response("ALREADY_USED", again);
    }

    return this.response("VALID", {
      ...ticket,
      status: TicketStatus.USED,
      validatedAt: now,
    });
  }

  private async resolveTicket(code: string): Promise<GateTicketRow | null> {
    if (code.includes(".")) {
      const payload = this.qr.verifyPayload(code);
      if (!payload) {
        return null;
      }
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: payload.ticketId },
        select: gateTicketSelect,
      });
      if (!ticket || ticket.code !== payload.code) {
        return null;
      }
      return ticket;
    }

    return this.prisma.ticket.findUnique({
      where: { code },
      select: gateTicketSelect,
    });
  }

  private response(result: GateValidateResult, ticket: GateTicketRow | null) {
    return {
      result,
      ticket: ticket
        ? {
            id: ticket.id,
            code: ticket.code,
            status: ticket.status,
            eventId: ticket.eventId,
            seat: ticket.seat,
            sector: ticket.sector,
            user: ticket.user,
            event: ticket.event,
            validatedAt: ticket.validatedAt,
          }
        : null,
    };
  }
}
