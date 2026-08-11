import { type INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import request from "supertest";
import type { App } from "supertest/types";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter";
import {
  THROTTLE_PRESETS,
  throttlerModuleOptions,
} from "../src/common/throttler/throttler.config";
import { AuthController } from "../src/modules/auth/auth.controller";
import { AuthService } from "../src/modules/auth/auth.service";
import { JwtRefreshGuard } from "../src/modules/auth/guards/jwt-refresh.guard";
import { HealthController } from "../src/modules/health/health.controller";

const loginBody = {
  email: "client@ticket.local",
  password: "Password123!",
};

describe("Throttler (e2e)", () => {
  let app: INestApplication<App>;

  const authService = {
    login: jest.fn(),
    register: jest.fn(),
    refreshTokens: jest.fn(),
    getMe: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    authService.login.mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot(throttlerModuleOptions)],
      controllers: [AuthController, HealthController],
      providers: [
        { provide: AuthService, useValue: authService },
        JwtRefreshGuard,
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
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
    await app?.close();
  });

  it("allows auth limit then returns 429", async () => {
    const server = app.getHttpServer();
    const limit = THROTTLE_PRESETS.auth.limit;

    for (let i = 0; i < limit; i += 1) {
      await request(server).post("/auth/login").send(loginBody).expect(200);
    }

    const blocked = await request(server)
      .post("/auth/login")
      .send(loginBody)
      .expect(429);

    expect(blocked.body.statusCode).toBe(429);
    expect(authService.login).toHaveBeenCalledTimes(limit);
  });

  it("does not count skipped health checks toward the auth limit", async () => {
    const server = app.getHttpServer();
    const limit = THROTTLE_PRESETS.auth.limit;

    for (let i = 0; i < limit + 5; i += 1) {
      await request(server).get("/health").expect(200);
    }

    for (let i = 0; i < limit; i += 1) {
      await request(server).post("/auth/login").send(loginBody).expect(200);
    }

    await request(server).post("/auth/login").send(loginBody).expect(429);
    await request(server).get("/health").expect(200);
  });
});
