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
import { CatalogModule } from "../src/modules/catalog/catalog.module";
import { CatalogService } from "../src/modules/catalog/catalog.service";
import { TicketmasterClient } from "../src/modules/catalog/clients/ticketmaster.client";
import { TmdbClient } from "../src/modules/catalog/clients/tmdb.client";
import { RolesGuard } from "../src/common/guards/roles.guard";
import { UserRole } from "../src/generated/prisma/enums";
import type { JwtPayload } from "../src/common/types/jwt-payload.type";

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
    req.user = {
      sub: "user-1",
      email: "test@ticket.local",
      role,
    };
    return true;
  }
}

const sampleItem = {
  source: "tmdb" as const,
  externalId: "movie:550",
  title: "Fight Club",
  description: "desc",
  imageUrl: "https://image.tmdb.org/t/p/w500/p.jpg",
  venue: null,
  startsAt: null,
  raw: {},
};

describe("CatalogController (e2e)", () => {
  let app: INestApplication<App>;
  const tmdb = {
    search: jest.fn(),
    getByExternalId: jest.fn(),
  };
  const ticketmaster = {
    search: jest.fn(),
    getByExternalId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    tmdb.search.mockResolvedValue({ items: [sampleItem] });
    tmdb.getByExternalId.mockResolvedValue(sampleItem);
    ticketmaster.search.mockResolvedValue({
      items: [{ ...sampleItem, source: "ticketmaster", externalId: "evt-1" }],
    });
    ticketmaster.getByExternalId.mockResolvedValue({
      ...sampleItem,
      source: "ticketmaster",
      externalId: "evt-1",
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CatalogModule],
      providers: [
        { provide: APP_GUARD, useClass: TestJwtGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    })
      .overrideProvider(TmdbClient)
      .useValue(tmdb)
      .overrideProvider(TicketmasterClient)
      .useValue(ticketmaster)
      .compile();

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
    return request(app.getHttpServer()).get("/catalog/tmdb/search?q=a").expect(401);
  });

  it("returns 403 for CLIENT and GATE", async () => {
    await request(app.getHttpServer())
      .get("/catalog/tmdb/search?q=a")
      .set("Authorization", `Bearer ${UserRole.CLIENT}`)
      .expect(403);

    await request(app.getHttpServer())
      .get("/catalog/ticketmaster/search?q=a")
      .set("Authorization", `Bearer ${UserRole.GATE}`)
      .expect(403);
  });

  it("returns 400 when q is missing for ORGANIZER", () => {
    return request(app.getHttpServer())
      .get("/catalog/tmdb/search")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .expect(400);
  });

  it("returns 400 for invalid source", () => {
    return request(app.getHttpServer())
      .get("/catalog/imdb/123")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .expect(400);
  });

  it("searches and details as ORGANIZER", async () => {
    const search = await request(app.getHttpServer())
      .get("/catalog/tmdb/search?q=fight")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .expect(200);

    expect(search.body.items).toHaveLength(1);
    expect(search.body.items[0].externalId).toBe("movie:550");
    expect(tmdb.search).toHaveBeenCalledWith("fight");

    const tmSearch = await request(app.getHttpServer())
      .get("/catalog/ticketmaster/search?q=show")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .expect(200);
    expect(tmSearch.body.items[0].source).toBe("ticketmaster");

    const detail = await request(app.getHttpServer())
      .get("/catalog/tmdb/movie:550")
      .set("Authorization", `Bearer ${UserRole.ORGANIZER}`)
      .expect(200);
    expect(detail.body.externalId).toBe("movie:550");
    expect(tmdb.getByExternalId).toHaveBeenCalledWith("movie:550");
  });

  it("wires CatalogService in module", () => {
    expect(app.get(CatalogService)).toBeDefined();
  });
});
