import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  EventStatus,
  ExternalSource,
  InventoryMode,
  UserRole,
} from "../../generated/prisma/enums";
import type { CatalogService } from "../catalog/catalog.service";
import type { CatalogItem } from "../catalog/types/catalog-item.type";
import type { PrismaService } from "../prisma/prisma.service";
import { EventsService } from "./events.service";
import { InventoryService } from "./inventory.service";

describe("EventsService", () => {
  const catalogItem: CatalogItem = {
    source: "tmdb",
    externalId: "movie:550",
    title: "Fight Club",
    description: "desc",
    imageUrl: "https://img/p.jpg",
    venue: null,
    startsAt: null,
    raw: { id: 550 },
  };

  const catalog = {
    getDetail: jest.fn(),
  };

  const prisma = {
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    seat: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    sector: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: EventsService;

  beforeEach(() => {
    jest.clearAllMocks();
    catalog.getDetail.mockResolvedValue(catalogItem);
    prisma.$transaction.mockImplementation(
      async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
    );
    service = new EventsService(
      prisma as unknown as PrismaService,
      catalog as unknown as CatalogService,
      new InventoryService(),
      { expireOverdueReservations: jest.fn().mockResolvedValue(0) } as never,
      {
        attachListMetrics: jest
          .fn()
          .mockImplementation(async (items: unknown[]) => items),
      } as never,
    );
  });

  it("creates SEAT_MAP event with catalog snapshot", async () => {
    const created = {
      id: "evt-1",
      title: "Fight Club",
      inventoryMode: InventoryMode.SEAT_MAP,
      status: EventStatus.DRAFT,
      _count: { seats: 120, sectors: 0 },
    };
    prisma.event.create.mockResolvedValue(created);

    const result = await service.create("org-1", {
      source: "tmdb",
      externalId: "movie:550",
      venue: "Cinema X",
      startsAt: "2026-09-01T20:00:00.000Z",
      gateOpensHoursBefore: 2,
      priceCents: 3500,
      inventoryMode: InventoryMode.SEAT_MAP,
    });

    expect(catalog.getDetail).toHaveBeenCalledWith("tmdb", "movie:550");
    expect(prisma.event.create).toHaveBeenCalled();
    const args = prisma.event.create.mock.calls[0][0];
    expect(args.data.organizerId).toBe("org-1");
    expect(args.data.title).toBe("Fight Club");
    expect(args.data.venue).toBe("Cinema X");
    expect(args.data.gateOpensHoursBefore).toBe(2);
    expect(args.data.externalSource).toBe("TMDB");
    expect(args.data.seats.createMany.data).toHaveLength(120);
    expect(result).toEqual(created);
  });

  it("creates GA_SECTOR event", async () => {
    prisma.event.create.mockResolvedValue({
      id: "evt-2",
      inventoryMode: InventoryMode.GA_SECTOR,
    });

    await service.create("org-1", {
      source: "ticketmaster",
      externalId: "tm-1",
      venue: "Arena",
      startsAt: "2026-10-01T21:00:00.000Z",
      gateOpensHoursBefore: 3,
      priceCents: 8000,
      inventoryMode: InventoryMode.GA_SECTOR,
      sectors: [{ name: "Pista", capacity: 50 }],
    });

    const args = prisma.event.create.mock.calls[0][0];
    expect(args.data.sectors.createMany.data).toEqual([
      { name: "Pista", capacity: 50, availableCount: 50, priceCents: null },
    ]);
  });

  it("requires venue and startsAt when catalog lacks them", async () => {
    await expect(
      service.create("org-1", {
        source: "tmdb",
        externalId: "movie:550",
        gateOpensHoursBefore: 2,
        priceCents: 100,
        inventoryMode: InventoryMode.SEAT_MAP,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects invalid source", async () => {
    await expect(
      service.create("org-1", {
        source: "imdb",
        externalId: "1",
        venue: "X",
        startsAt: "2026-01-01T00:00:00.000Z",
        gateOpensHoursBefore: 2,
        priceCents: 100,
        inventoryMode: InventoryMode.SEAT_MAP,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("lists only published events", async () => {
    prisma.event.findMany.mockResolvedValue([{ id: "p1" }]);
    const result = await service.listPublished({ q: "fight" });
    expect(prisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: EventStatus.PUBLISHED,
          title: { contains: "fight" },
        }),
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(
      expect.objectContaining({ ticketsSold: 0 }),
    );
  });

  it("filters published list by catalog source", async () => {
    prisma.event.findMany.mockResolvedValue([]);
    await service.listPublished({ source: "tmdb" });
    expect(prisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: EventStatus.PUBLISHED,
          externalSource: ExternalSource.TMDB,
        }),
      }),
    );
  });

  it("filters published list by date, price and venue", async () => {
    prisma.event.findMany.mockResolvedValue([]);
    await service.listPublished({
      from: "2026-09-01T00:00:00.000Z",
      to: "2026-12-31T23:59:59.000Z",
      priceMin: 1000,
      priceMax: 5000,
      venue: "Arena",
    });
    expect(prisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: EventStatus.PUBLISHED,
          venue: { contains: "Arena" },
          priceCents: { gte: 1000, lte: 5000 },
          startsAt: {
            gte: new Date("2026-09-01T00:00:00.000Z"),
            lte: new Date("2026-12-31T23:59:59.000Z"),
          },
        }),
      }),
    );
  });

  it("filters with priceMin only", async () => {
    prisma.event.findMany.mockResolvedValue([]);
    await service.listPublished({ priceMin: 2000 });
    expect(prisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          priceCents: { gte: 2000 },
        }),
      }),
    );
  });

  it("rejects invalid from date", async () => {
    await expect(
      service.listPublished({ from: "not-a-date" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("listMine attaches metrics via EventMetricsService", async () => {
    const attachListMetrics = jest.fn().mockResolvedValue([
      {
        id: "evt-1",
        ticketsSold: 2,
        capacity: 120,
        occupancyPct: 2 / 120,
        revenueCents: 7000,
        ticketsUsed: 1,
        pendingHolds: 0,
      },
    ]);
    service = new EventsService(
      prisma as unknown as PrismaService,
      catalog as unknown as CatalogService,
      new InventoryService(),
      { expireOverdueReservations: jest.fn().mockResolvedValue(0) } as never,
      { attachListMetrics } as never,
    );
    prisma.event.findMany.mockResolvedValue([
      { id: "evt-1", _count: { tickets: 2 } },
    ]);

    const result = await service.listMine("org-1");
    expect(attachListMetrics).toHaveBeenCalledWith([
      expect.objectContaining({ id: "evt-1", ticketsSold: 2 }),
    ]);
    expect(result.items[0]).toMatchObject({
      capacity: 120,
      revenueCents: 7000,
    });
  });

  it("hides draft from non-owner", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-1",
      organizerId: "org-1",
      status: EventStatus.DRAFT,
    });

    await expect(
      service.getById("evt-1", { sub: "other", role: UserRole.ORGANIZER }),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(service.getById("evt-1", null)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("allows owner to view draft", async () => {
    const draft = {
      id: "evt-1",
      organizerId: "org-1",
      status: EventStatus.DRAFT,
    };
    prisma.event.findUnique.mockResolvedValue(draft);
    await expect(
      service.getById("evt-1", { sub: "org-1", role: UserRole.ORGANIZER }),
    ).resolves.toEqual(draft);
  });

  it("publishes draft with inventory", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-1",
      organizerId: "org-1",
      status: EventStatus.DRAFT,
      inventoryMode: InventoryMode.SEAT_MAP,
    });
    prisma.seat.count.mockResolvedValue(10);
    prisma.event.update.mockResolvedValue({
      id: "evt-1",
      status: EventStatus.PUBLISHED,
    });

    await expect(service.publish("evt-1", "org-1")).resolves.toMatchObject({
      status: EventStatus.PUBLISHED,
    });
  });

  it("rejects publish without inventory", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-1",
      organizerId: "org-1",
      status: EventStatus.DRAFT,
      inventoryMode: InventoryMode.GA_SECTOR,
    });
    prisma.sector.count.mockResolvedValue(0);

    await expect(service.publish("evt-1", "org-1")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("rejects patch on published event", async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: "evt-1",
      organizerId: "org-1",
      status: EventStatus.PUBLISHED,
      inventoryMode: InventoryMode.SEAT_MAP,
    });

    await expect(
      service.update("evt-1", "org-1", { title: "Novo" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
