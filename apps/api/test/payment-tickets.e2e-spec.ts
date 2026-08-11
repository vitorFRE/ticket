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
import { ReservationStatus, UserRole } from "../src/generated/prisma/enums";
import { ReservationsController } from "../src/modules/reservations/reservations.controller";
import { ReservationsService } from "../src/modules/reservations/reservations.service";
import { PublicTicketsController } from "../src/modules/tickets/public-tickets.controller";
import { TicketsController } from "../src/modules/tickets/tickets.controller";
import { TicketsService } from "../src/modules/tickets/tickets.service";

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
      sub: role === UserRole.CLIENT ? "client-1" : "user-1",
      email: "test@ticket.local",
      role,
    };
    return true;
  }
}

describe("Payment + Tickets (e2e)", () => {
  let app: INestApplication<App>;

  const reservationsService = {
    create: jest.fn(),
    listMine: jest.fn(),
    getById: jest.fn(),
    pay: jest.fn(),
  };

  const ticketsService = {
    listMine: jest.fn(),
    getById: jest.fn(),
    share: jest.fn(),
    getPublicByToken: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    reservationsService.pay.mockResolvedValue({
      id: "r1",
      status: ReservationStatus.PAID,
      tickets: [{ id: "t1", code: "c1" }],
    });
    ticketsService.listMine.mockResolvedValue({ items: [{ id: "t1" }] });
    ticketsService.getById.mockResolvedValue({ id: "t1", code: "c1" });
    ticketsService.share.mockResolvedValue({
      token: "tok",
      url: "http://localhost:3000/t/tok",
    });
    ticketsService.getPublicByToken.mockResolvedValue({
      code: "c1",
      status: "VALID",
      event: { title: "Show" },
      seat: null,
      sector: null,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        ReservationsController,
        TicketsController,
        PublicTicketsController,
      ],
      providers: [
        { provide: ReservationsService, useValue: reservationsService },
        { provide: TicketsService, useValue: ticketsService },
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

  it("pays reservation as CLIENT", async () => {
    const res = await request(app.getHttpServer())
      .post("/reservations/r1/pay")
      .set("Authorization", `Bearer ${UserRole.CLIENT}`)
      .send({ outcome: "APPROVED" })
      .expect(201);

    expect(res.body.status).toBe(ReservationStatus.PAID);
    expect(reservationsService.pay).toHaveBeenCalledWith(
      "r1",
      "client-1",
      expect.objectContaining({ outcome: "APPROVED" }),
    );
  });

  it("returns 400 for invalid pay outcome", async () => {
    await request(app.getHttpServer())
      .post("/reservations/r1/pay")
      .set("Authorization", `Bearer ${UserRole.CLIENT}`)
      .send({ outcome: "MAYBE" })
      .expect(400);
  });

  it("returns 403 for ORGANIZER pay", async () => {
    await request(app.getHttpServer())
      .post("/reservations/r1/pay")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .send({ outcome: "APPROVED" })
      .expect(403);
  });

  it("lists and shares tickets as CLIENT", async () => {
    await request(app.getHttpServer())
      .get("/tickets/mine")
      .set("Authorization", `Bearer ${UserRole.CLIENT}`)
      .expect(200);

    await request(app.getHttpServer())
      .post("/tickets/t1/share")
      .set("Authorization", `Bearer ${UserRole.CLIENT}`)
      .expect(201);

    expect(ticketsService.share).toHaveBeenCalledWith("t1", "client-1");
  });

  it("returns public ticket without auth", async () => {
    const res = await request(app.getHttpServer())
      .get("/public/tickets/tok")
      .expect(200);
    expect(res.body.code).toBe("c1");
    expect(res.body).not.toHaveProperty("userId");
  });
});
