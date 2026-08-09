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

class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: JwtPayload;
    }>();
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException();
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

describe("ReservationsController (e2e)", () => {
  let app: INestApplication<App>;

  const reservationsService = {
    create: jest.fn(),
    listMine: jest.fn(),
    getById: jest.fn(),
    expireOverdueReservations: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    reservationsService.create.mockResolvedValue({
      id: "r1",
      status: ReservationStatus.PENDING,
    });
    reservationsService.listMine.mockResolvedValue({ items: [] });
    reservationsService.getById.mockResolvedValue({
      id: "r1",
      status: ReservationStatus.PENDING,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        { provide: ReservationsService, useValue: reservationsService },
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

  it("returns 401 without token", () => {
    return request(app.getHttpServer()).get("/reservations/mine").expect(401);
  });

  it("returns 403 for ORGANIZER", async () => {
    await request(app.getHttpServer())
      .post("/reservations")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .send({
        eventId: "00000000-0000-4000-8000-000000000001",
        seatIds: ["00000000-0000-4000-8000-000000000011"],
      })
      .expect(403);
  });

  it("creates reservation as CLIENT", async () => {
    const res = await request(app.getHttpServer())
      .post("/reservations")
      .set("Authorization", `Bearer ${UserRole.CLIENT}`)
      .send({
        eventId: "00000000-0000-4000-8000-000000000001",
        seatIds: ["00000000-0000-4000-8000-000000000011"],
      })
      .expect(201);

    expect(res.body.id).toBe("r1");
    expect(reservationsService.create).toHaveBeenCalledWith(
      "client-1",
      expect.objectContaining({
        eventId: "00000000-0000-4000-8000-000000000001",
      }),
    );
  });

  it("returns 400 when payload is incomplete", async () => {
    await request(app.getHttpServer())
      .post("/reservations")
      .set("Authorization", `Bearer ${UserRole.CLIENT}`)
      .send({ eventId: "00000000-0000-4000-8000-000000000001" })
      .expect(400);
  });

  it("lists mine as CLIENT", async () => {
    await request(app.getHttpServer())
      .get("/reservations/mine")
      .set("Authorization", `Bearer ${UserRole.CLIENT}`)
      .expect(200);
    expect(reservationsService.listMine).toHaveBeenCalledWith("client-1");
  });

  it("gets reservation by id", async () => {
    await request(app.getHttpServer())
      .get("/reservations/r1")
      .set("Authorization", `Bearer ${UserRole.CLIENT}`)
      .expect(200);
    expect(reservationsService.getById).toHaveBeenCalledWith("r1", "client-1");
  });
});
