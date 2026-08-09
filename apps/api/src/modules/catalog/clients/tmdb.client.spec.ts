import {
  BadGatewayException,
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TmdbClient } from "./tmdb.client";
import type { HttpFetcher } from "../http/http-fetcher";

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("TmdbClient", () => {
  const http = { fetch: jest.fn() } as unknown as HttpFetcher & {
    fetch: jest.Mock;
  };
  let configValues: Record<string, string>;
  let client: TmdbClient;

  beforeEach(() => {
    configValues = {
      "catalog.tmdbApiKey": "test-key",
      "catalog.tmdbAccessToken": "",
    };
    const config = {
      get: (key: string) => configValues[key],
    } as ConfigService;
    http.fetch.mockReset();
    client = new TmdbClient(config, http);
  });

  it("maps movie/tv search results and ignores person", async () => {
    http.fetch.mockResolvedValue(
      mockResponse(200, {
        results: [
          {
            id: 550,
            media_type: "movie",
            title: "Fight Club",
            overview: "desc",
            poster_path: "/p.jpg",
          },
          {
            id: 1399,
            media_type: "tv",
            name: "GoT",
            overview: "",
            poster_path: null,
          },
          {
            id: 1,
            media_type: "person",
            name: "Someone",
          },
        ],
      }),
    );

    const result = await client.search("fight");

    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toMatchObject({
      source: "tmdb",
      externalId: "movie:550",
      title: "Fight Club",
      description: "desc",
      imageUrl: "https://image.tmdb.org/t/p/w500/p.jpg",
      venue: null,
      startsAt: null,
    });
    expect(result.items[1]).toMatchObject({
      externalId: "tv:1399",
      title: "GoT",
      description: null,
      imageUrl: null,
    });
    expect(http.fetch.mock.calls[0][0]).toContain("api_key=test-key");
  });

  it("returns empty items when upstream has no results", async () => {
    http.fetch.mockResolvedValue(mockResponse(200, { results: [] }));
    await expect(client.search("zzz")).resolves.toEqual({ items: [] });
  });

  it("gets movie and tv detail by composite id", async () => {
    http.fetch.mockResolvedValue(
      mockResponse(200, {
        id: 550,
        title: "Fight Club",
        overview: "desc",
        poster_path: "/p.jpg",
      }),
    );

    await expect(client.getByExternalId("movie:550")).resolves.toMatchObject({
      externalId: "movie:550",
      title: "Fight Club",
    });
    expect(http.fetch.mock.calls[0][0]).toContain("/movie/550");

    http.fetch.mockResolvedValue(
      mockResponse(200, {
        id: 1399,
        name: "GoT",
        overview: "tv",
        poster_path: null,
      }),
    );
    await expect(client.getByExternalId("tv:1399")).resolves.toMatchObject({
      externalId: "tv:1399",
      title: "GoT",
    });
  });

  it("rejects invalid externalId", () => {
    expect(() => client.parseExternalId("550")).toThrow(BadRequestException);
    expect(() => client.parseExternalId("person:1")).toThrow(
      BadRequestException,
    );
    expect(() => client.parseExternalId("movie:abc")).toThrow(
      BadRequestException,
    );
  });

  it("throws 503 when no credentials", async () => {
    configValues["catalog.tmdbApiKey"] = "";
    configValues["catalog.tmdbAccessToken"] = "";
    await expect(client.search("x")).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it("uses bearer fallback when api key missing", async () => {
    configValues["catalog.tmdbApiKey"] = "";
    configValues["catalog.tmdbAccessToken"] = "token-v4";
    http.fetch.mockResolvedValue(mockResponse(200, { results: [] }));

    await client.search("x");

    const [, init] = http.fetch.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer token-v4");
    expect(http.fetch.mock.calls[0][0]).not.toContain("api_key=");
  });

  it("throws BadGateway on upstream error and network failure", async () => {
    http.fetch.mockResolvedValue(mockResponse(500, {}));
    await expect(client.search("x")).rejects.toBeInstanceOf(BadGatewayException);

    http.fetch.mockRejectedValue(new Error("network"));
    await expect(client.search("x")).rejects.toBeInstanceOf(BadGatewayException);
  });

  it("throws NotFound on detail 404", async () => {
    http.fetch.mockResolvedValue(mockResponse(404, {}));
    await expect(client.getByExternalId("movie:1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
