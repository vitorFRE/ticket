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
import { TicketStatus, UserRole } from "../src/generated/prisma/enums";
import { GateController } from "../src/modules/gate/gate.controller";
import { GateService } from "../src/modules/gate/gate.service";

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
      sub: role === UserRole.GATE ? "gate-1" : "user-1",
      email: "test@ticket.local",
      role,
    };
    return true;
  }
}

describe("Gate (e2e)", () => {
  let app: INestApplication<App>;

  const gateService = {
    validate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    gateService.validate.mockResolvedValue({
      result: "VALID",
      ticket: {
        id: "t1",
        code: "c1",
        status: TicketStatus.USED,
        eventId: "00000000-0000-4000-8000-000000000001",
        seat: { label: "A1" },
        sector: null,
        validatedAt: new Date().toISOString(),
      },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [GateController],
      providers: [
        { provide: GateService, useValue: gateService },
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

  it("validates ticket as GATE", async () => {
    const eventId = "00000000-0000-4000-8000-000000000001";
    const res = await request(app.getHttpServer())
      .post("/gate/validate")
      .set("Authorization", `Bearer ${UserRole.GATE}`)
      .send({ eventId, code: "body.sig" })
      .expect(200);

    expect(res.body.result).toBe("VALID");
    expect(gateService.validate).toHaveBeenCalledWith(
      eventId,
      "body.sig",
      "gate-1",
    );
  });

  it("returns 400 for invalid body", async () => {
    await request(app.getHttpServer())
      .post("/gate/validate")
      .set("Authorization", `Bearer ${UserRole.GATE}`)
      .send({ eventId: "not-a-uuid", code: "" })
      .expect(400);
  });

  it("returns 403 for CLIENT", async () => {
    await request(app.getHttpServer())
      .post("/gate/validate")
      .set("Authorization", `Bearer ${UserRole.CLIENT}`)
      .send({
        eventId: "00000000-0000-4000-8000-000000000001",
        code: "c1",
      })
      .expect(403);
  });

  it("returns 403 for ORGANIZER", async () => {
    await request(app.getHttpServer())
      .post("/gate/validate")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .send({
        eventId: "00000000-0000-4000-8000-000000000001",
        code: "c1",
      })
      .expect(403);
  });
});
