import { NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { PrismaService } from "../prisma/prisma.service";
import { TicketQrService } from "./ticket-qr.service";
import { TicketsService } from "./tickets.service";

describe("TicketsService", () => {
  const prisma = {
    ticket: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    ticketShare: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const qr = {
    createCode: jest.fn().mockReturnValue("code-1"),
    createShareToken: jest.fn().mockReturnValue("share-token"),
    buildPayload: jest.fn().mockReturnValue("body.sig"),
  };

  const config = {
    get: jest.fn().mockReturnValue("http://localhost:3000"),
  };

  let service: TicketsService;

  beforeEach(() => {
    jest.clearAllMocks();
    config.get.mockReturnValue("http://localhost:3000");
    service = new TicketsService(
      prisma as unknown as PrismaService,
      qr as unknown as TicketQrService,
      config as unknown as ConfigService,
    );
  });

  it("lists mine", async () => {
    prisma.ticket.findMany.mockResolvedValue([{ id: "t1" }]);
    await expect(service.listMine("u1")).resolves.toEqual({
      items: [{ id: "t1" }],
    });
  });

  it("returns 404 for other user ticket", async () => {
    prisma.ticket.findUnique.mockResolvedValue({ id: "t1", userId: "other" });
    await expect(service.getById("t1", "u1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("shares ticket idempotently", async () => {
    prisma.ticket.findUnique.mockResolvedValue({ id: "t1", userId: "u1" });
    prisma.ticketShare.findUnique.mockResolvedValue(null);
    prisma.ticketShare.create.mockResolvedValue({
      ticketId: "t1",
      publicToken: "share-token",
    });

    const first = await service.share("t1", "u1");
    expect(first).toEqual({
      token: "share-token",
      url: "http://localhost:3000/t/share-token",
    });

    prisma.ticketShare.findUnique.mockResolvedValue({
      ticketId: "t1",
      publicToken: "share-token",
    });
    const second = await service.share("t1", "u1");
    expect(second.token).toBe("share-token");
    expect(prisma.ticketShare.create).toHaveBeenCalledTimes(1);
  });

  it("returns public ticket without user id", async () => {
    prisma.ticketShare.findUnique.mockResolvedValue({
      publicToken: "tok",
      ticket: {
        code: "c1",
        status: "VALID",
        userId: "secret-user",
        event: { id: "e1", title: "Show" },
        seat: { label: "A1" },
        sector: null,
      },
    });

    const result = await service.getPublicByToken("tok");
    expect(result).toEqual({
      code: "c1",
      status: "VALID",
      event: { id: "e1", title: "Show" },
      seat: { label: "A1" },
      sector: null,
    });
    expect(result).not.toHaveProperty("userId");
  });
});
