import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";
import { RolesGuard } from "../src/common/guards/roles.guard";
import type { JwtPayload } from "../src/common/types/jwt-payload.type";
import {
  EventStatus,
  InventoryMode,
  UserRole,
} from "../src/generated/prisma/enums";
import { EventsController } from "../src/modules/events/events.controller";
import { EventsService } from "../src/modules/events/events.service";

class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: JwtPayload;
    }>();
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return true;
    }
    const role = header.slice("Bearer ".length) as UserRole;
    if (!(Object.values(UserRole) as string[]).includes(role)) {
      throw new UnauthorizedException();
    }
    req.user = {
      sub: role === UserRole.ORGANIZER ? "org-1" : "user-1",
      email: "test@ticket.local",
      role,
    };
    return true;
  }
}

describe("EventsController (e2e)", () => {
  let app: INestApplication<App>;

  const eventsService = {
    listPublished: jest.fn(),
    listMine: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    publish: jest.fn(),
    listSeats: jest.fn(),
    listSectors: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    eventsService.listPublished.mockResolvedValue({
      items: [{ id: "pub-1", status: EventStatus.PUBLISHED }],
    });
    eventsService.listMine.mockResolvedValue({ items: [] });
    eventsService.getById.mockResolvedValue({
      id: "pub-1",
      status: EventStatus.PUBLISHED,
    });
    eventsService.create.mockResolvedValue({
      id: "evt-1",
      status: EventStatus.DRAFT,
      inventoryMode: InventoryMode.SEAT_MAP,
      _count: { seats: 120, sectors: 0 },
    });
    eventsService.publish.mockResolvedValue({
      id: "evt-1",
      status: EventStatus.PUBLISHED,
    });
    eventsService.listSeats.mockResolvedValue({
      eventId: "evt-1",
      items: [{ label: "A1", status: "AVAILABLE" }],
    });
    eventsService.listSectors.mockResolvedValue({
      eventId: "evt-2",
      items: [{ name: "Pista", capacity: 10, priceCents: 8000 }],
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: EventsService, useValue: eventsService },
        { provide: APP_GUARD, useClass: TestJwtGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("lists published events publicly", async () => {
    const res = await request(app.getHttpServer())
      .get("/events?q=fight")
      .expect(200);
    expect(res.body.items).toHaveLength(1);
    expect(eventsService.listPublished).toHaveBeenCalledWith("fight", undefined);
  });

  it("lists published events by catalog source", async () => {
    const res = await request(app.getHttpServer())
      .get("/events?source=tmdb")
      .expect(200);
    expect(res.body.items).toHaveLength(1);
    expect(eventsService.listPublished).toHaveBeenCalledWith(undefined, "tmdb");
  });

  it("returns 403 for CLIENT creating event", async () => {
    await request(app.getHttpServer())
      .post("/events")
      .set("Authorization", `Bearer ${UserRole.CLIENT}`)
      .send({
        source: "tmdb",
        externalId: "movie:550",
        venue: "Cinema",
        startsAt: "2026-09-01T20:00:00.000Z",
        priceCents: 3500,
        inventoryMode: InventoryMode.SEAT_MAP,
      })
      .expect(403);
  });

  it("creates SEAT_MAP as ORGANIZER", async () => {
    const res = await request(app.getHttpServer())
      .post("/events")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .send({
        source: "tmdb",
        externalId: "movie:550",
        venue: "Cinema",
        startsAt: "2026-09-01T20:00:00.000Z",
        priceCents: 3500,
        inventoryMode: InventoryMode.SEAT_MAP,
      })
      .expect(201);

    expect(res.body.id).toBe("evt-1");
    expect(eventsService.create).toHaveBeenCalledWith(
      "org-1",
      expect.objectContaining({
        source: "tmdb",
        inventoryMode: InventoryMode.SEAT_MAP,
      }),
    );
  });

  it("creates GA_SECTOR as ORGANIZER", async () => {
    eventsService.create.mockResolvedValue({
      id: "evt-2",
      inventoryMode: InventoryMode.GA_SECTOR,
    });

    await request(app.getHttpServer())
      .post("/events")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .send({
        source: "ticketmaster",
        externalId: "tm-1",
        venue: "Arena",
        startsAt: "2026-10-01T21:00:00.000Z",
        priceCents: 8000,
        inventoryMode: InventoryMode.GA_SECTOR,
        sectors: [{ name: "Pista", capacity: 50 }],
      })
      .expect(201);

    expect(eventsService.create).toHaveBeenCalledWith(
      "org-1",
      expect.objectContaining({
        inventoryMode: InventoryMode.GA_SECTOR,
        sectors: [{ name: "Pista", capacity: 50 }],
      }),
    );
  });

  it("returns 400 when GA_SECTOR missing sectors", async () => {
    await request(app.getHttpServer())
      .post("/events")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .send({
        source: "tmdb",
        externalId: "movie:550",
        venue: "Cinema",
        startsAt: "2026-09-01T20:00:00.000Z",
        priceCents: 3500,
        inventoryMode: InventoryMode.GA_SECTOR,
      })
      .expect(400);
  });

  it("publishes event", async () => {
    await request(app.getHttpServer())
      .post("/events/evt-1/publish")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .expect(201);
    expect(eventsService.publish).toHaveBeenCalledWith("evt-1", "org-1");
  });

  it("returns seats and sectors publicly", async () => {
    await request(app.getHttpServer()).get("/events/evt-1/seats").expect(200);
    expect(eventsService.listSeats).toHaveBeenCalledWith("evt-1", null);

    await request(app.getHttpServer()).get("/events/evt-2/sectors").expect(200);
    expect(eventsService.listSectors).toHaveBeenCalledWith("evt-2", null);
  });

  it("lists mine as ORGANIZER", async () => {
    await request(app.getHttpServer())
      .get("/events/mine")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .expect(200);
    expect(eventsService.listMine).toHaveBeenCalledWith("org-1");
  });
});
