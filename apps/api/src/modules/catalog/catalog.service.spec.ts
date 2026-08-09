import { BadRequestException } from "@nestjs/common";
import { CatalogService } from "./catalog.service";
import type { TicketmasterClient } from "./clients/ticketmaster.client";
import type { TmdbClient } from "./clients/tmdb.client";
import type { CatalogItem } from "./types/catalog-item.type";

describe("CatalogService", () => {
  const tmdbItem: CatalogItem = {
    source: "tmdb",
    externalId: "movie:1",
    title: "A",
    description: null,
    imageUrl: null,
    venue: null,
    startsAt: null,
    raw: {},
  };

  const tmItem: CatalogItem = {
    source: "ticketmaster",
    externalId: "evt-1",
    title: "B",
    description: null,
    imageUrl: null,
    venue: null,
    startsAt: null,
    raw: {},
  };

  const tmdb = {
    search: jest.fn(),
    getByExternalId: jest.fn(),
  };
  const ticketmaster = {
    search: jest.fn(),
    getByExternalId: jest.fn(),
  };

  let service: CatalogService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CatalogService(
      tmdb as unknown as TmdbClient,
      ticketmaster as unknown as TicketmasterClient,
    );
  });

  it("delegates search to the correct client", async () => {
    tmdb.search.mockResolvedValue({ items: [tmdbItem] });
    ticketmaster.search.mockResolvedValue({ items: [tmItem] });

    await expect(service.searchTmdb("a")).resolves.toEqual({
      items: [tmdbItem],
    });
    await expect(service.searchTicketmaster("b")).resolves.toEqual({
      items: [tmItem],
    });
  });

  it("delegates detail by source", async () => {
    tmdb.getByExternalId.mockResolvedValue(tmdbItem);
    ticketmaster.getByExternalId.mockResolvedValue(tmItem);

    await expect(service.getDetail("tmdb", "movie:1")).resolves.toEqual(
      tmdbItem,
    );
    await expect(service.getDetail("ticketmaster", "evt-1")).resolves.toEqual(
      tmItem,
    );
  });

  it("rejects invalid source", async () => {
    await expect(service.getDetail("imdb", "1")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
