import { TicketStatus } from "../../generated/prisma/enums";
import type { PrismaService } from "../prisma/prisma.service";
import type { TicketQrService } from "../tickets/ticket-qr.service";
import { GateService } from "./gate.service";

describe("GateService", () => {
  const prisma = {
    ticket: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const qr = {
    verifyPayload: jest.fn(),
  };

  let service: GateService;

  const baseTicket = {
    id: "ticket-1",
    code: "code-uuid-1",
    status: TicketStatus.VALID,
    eventId: "event-1",
    validatedAt: null,
    seat: { label: "A1" },
    sector: null,
    user: { name: "Cliente Um" },
    event: {
      id: "event-1",
      title: "Interestelar",
      startsAt: new Date("2020-01-01T20:00:00.000Z"),
      gateOpensHoursBefore: 2,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GateService(
      prisma as unknown as PrismaService,
      qr as unknown as TicketQrService,
    );
  });

  it("validates by opaque UUID code", async () => {
    prisma.ticket.findUnique.mockResolvedValue(baseTicket);
    prisma.ticket.updateMany.mockResolvedValue({ count: 1 });

    const res = await service.validate("event-1", "code-uuid-1", "gate-1");

    expect(qr.verifyPayload).not.toHaveBeenCalled();
    expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
      where: { code: "code-uuid-1" },
      select: expect.any(Object),
    });
    expect(prisma.ticket.updateMany).toHaveBeenCalledWith({
      where: { id: "ticket-1", status: TicketStatus.VALID },
      data: {
        status: TicketStatus.USED,
        validatedAt: expect.any(Date),
        validatedById: "gate-1",
      },
    });
    expect(res.result).toBe("VALID");
    expect(res.ticket?.status).toBe(TicketStatus.USED);
    expect(res.ticket?.seat).toEqual({ label: "A1" });
    expect(res.ticket?.user).toEqual({ name: "Cliente Um" });
    expect(res.ticket?.event).toEqual({
      id: "event-1",
      title: "Interestelar",
      startsAt: new Date("2020-01-01T20:00:00.000Z"),
      gateOpensHoursBefore: 2,
    });
  });

  it("validates by HMAC qrPayload", async () => {
    qr.verifyPayload.mockReturnValue({
      code: "code-uuid-1",
      eventId: "event-1",
      ticketId: "ticket-1",
    });
    prisma.ticket.findUnique.mockResolvedValue(baseTicket);
    prisma.ticket.updateMany.mockResolvedValue({ count: 1 });

    const res = await service.validate("event-1", "body.signature", "gate-1");

    expect(qr.verifyPayload).toHaveBeenCalledWith("body.signature");
    expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
      where: { id: "ticket-1" },
      select: expect.any(Object),
    });
    expect(res.result).toBe("VALID");
  });

  it("returns INVALID for broken HMAC", async () => {
    qr.verifyPayload.mockReturnValue(null);

    const res = await service.validate("event-1", "tampered.sig", "gate-1");

    expect(res).toEqual({ result: "INVALID", ticket: null });
    expect(prisma.ticket.findUnique).not.toHaveBeenCalled();
  });

  it("returns INVALID when payload ticketId/code mismatch", async () => {
    qr.verifyPayload.mockReturnValue({
      code: "other-code",
      eventId: "event-1",
      ticketId: "ticket-1",
    });
    prisma.ticket.findUnique.mockResolvedValue(baseTicket);

    const res = await service.validate("event-1", "body.sig", "gate-1");

    expect(res).toEqual({ result: "INVALID", ticket: null });
  });

  it("returns INVALID when ticket missing", async () => {
    prisma.ticket.findUnique.mockResolvedValue(null);

    const res = await service.validate("event-1", "missing-code", "gate-1");

    expect(res).toEqual({ result: "INVALID", ticket: null });
  });

  it("returns INVALID for VOID tickets", async () => {
    prisma.ticket.findUnique.mockResolvedValue({
      ...baseTicket,
      status: TicketStatus.VOID,
    });

    const res = await service.validate("event-1", "code-uuid-1", "gate-1");

    expect(res).toEqual({ result: "INVALID", ticket: null });
    expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
  });

  it("returns WRONG_EVENT when eventId mismatches", async () => {
    prisma.ticket.findUnique.mockResolvedValue(baseTicket);

    const res = await service.validate("event-other", "code-uuid-1", "gate-1");

    expect(res.result).toBe("WRONG_EVENT");
    expect(res.ticket?.eventId).toBe("event-1");
    expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
  });

  it("returns ALREADY_USED when status is USED", async () => {
    const used = {
      ...baseTicket,
      status: TicketStatus.USED,
      validatedAt: new Date("2026-01-01"),
    };
    prisma.ticket.findUnique.mockResolvedValue(used);

    const res = await service.validate("event-1", "code-uuid-1", "gate-1");

    expect(res.result).toBe("ALREADY_USED");
    expect(res.ticket?.status).toBe(TicketStatus.USED);
    expect(res.ticket?.validatedAt).toEqual(new Date("2026-01-01"));
    expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
  });

  it("returns ALREADY_USED on updateMany race", async () => {
    prisma.ticket.findUnique
      .mockResolvedValueOnce(baseTicket)
      .mockResolvedValueOnce({
        ...baseTicket,
        status: TicketStatus.USED,
        validatedAt: new Date("2026-01-02"),
      });
    prisma.ticket.updateMany.mockResolvedValue({ count: 0 });

    const res = await service.validate("event-1", "code-uuid-1", "gate-1");

    expect(res.result).toBe("ALREADY_USED");
    expect(prisma.ticket.findUnique).toHaveBeenCalledTimes(2);
  });

  it("returns GATE_CLOSED before the opening window", async () => {
    prisma.ticket.findUnique.mockResolvedValue({
      ...baseTicket,
      event: {
        ...baseTicket.event,
        startsAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
        gateOpensHoursBefore: 2,
      },
    });

    const res = await service.validate("event-1", "code-uuid-1", "gate-1");

    expect(res.result).toBe("GATE_CLOSED");
    expect(res.ticket?.status).toBe(TicketStatus.VALID);
    expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
  });

  it("validates at the opening instant", async () => {
    const now = Date.now();
    prisma.ticket.findUnique.mockResolvedValue({
      ...baseTicket,
      event: {
        ...baseTicket.event,
        startsAt: new Date(now + 2 * 60 * 60 * 1000),
        gateOpensHoursBefore: 2,
      },
    });
    prisma.ticket.updateMany.mockResolvedValue({ count: 1 });

    const res = await service.validate("event-1", "code-uuid-1", "gate-1");

    expect(res.result).toBe("VALID");
    expect(prisma.ticket.updateMany).toHaveBeenCalled();
  });

  it("returns ALREADY_USED even when the gate is still closed", async () => {
    prisma.ticket.findUnique.mockResolvedValue({
      ...baseTicket,
      status: TicketStatus.USED,
      validatedAt: new Date("2026-01-01"),
      event: {
        ...baseTicket.event,
        startsAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
        gateOpensHoursBefore: 2,
      },
    });

    const res = await service.validate("event-1", "code-uuid-1", "gate-1");

    expect(res.result).toBe("ALREADY_USED");
    expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
  });

  it("validates before start when the event has no hour limit", async () => {
    prisma.ticket.findUnique.mockResolvedValue({
      ...baseTicket,
      event: {
        ...baseTicket.event,
        startsAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
        gateOpensHoursBefore: null,
      },
    });
    prisma.ticket.updateMany.mockResolvedValue({ count: 1 });

    const res = await service.validate("event-1", "code-uuid-1", "gate-1");

    expect(res.result).toBe("VALID");
    expect(prisma.ticket.updateMany).toHaveBeenCalled();
  });
});
