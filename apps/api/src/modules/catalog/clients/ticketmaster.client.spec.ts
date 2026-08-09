import {
  BadGatewayException,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { HttpFetcher } from "../http/http-fetcher";
import { TicketmasterClient } from "./ticketmaster.client";

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("TicketmasterClient", () => {
  const http = { fetch: jest.fn() } as unknown as HttpFetcher & {
    fetch: jest.Mock;
  };
  let configValues: Record<string, string>;
  let client: TicketmasterClient;

  beforeEach(() => {
    configValues = { "catalog.ticketmasterApiKey": "tm-key" };
    const config = {
      get: (key: string) => configValues[key],
    } as ConfigService;
    http.fetch.mockReset();
    client = new TicketmasterClient(config, http);
  });

  it("maps search events with venue, startsAt and image", async () => {
    http.fetch.mockResolvedValue(
      mockResponse(200, {
        _embedded: {
          events: [
            {
              id: "evt-1",
              name: "Show",
              info: "  info  ",
              images: [{ url: "https://img/a.jpg" }],
              dates: { start: { dateTime: "2026-09-01T20:00:00Z" } },
              _embedded: { venues: [{ name: "Arena" }] },
            },
          ],
        },
      }),
    );

    const result = await client.search("show");

    expect(result.items).toEqual([
      expect.objectContaining({
        source: "ticketmaster",
        externalId: "evt-1",
        title: "Show",
        description: "info",
        imageUrl: "https://img/a.jpg",
        venue: "Arena",
        startsAt: "2026-09-01T20:00:00Z",
      }),
    ]);
    expect(http.fetch.mock.calls[0][0]).toContain("apikey=tm-key");
  });

  it("returns empty items when no embedded events", async () => {
    http.fetch.mockResolvedValue(mockResponse(200, {}));
    await expect(client.search("zzz")).resolves.toEqual({ items: [] });
  });

  it("gets detail by external id", async () => {
    http.fetch.mockResolvedValue(
      mockResponse(200, {
        id: "evt-1",
        name: "Show",
        pleaseNote: "note",
        dates: { start: { localDate: "2026-09-01" } },
      }),
    );

    await expect(client.getByExternalId("evt-1")).resolves.toMatchObject({
      externalId: "evt-1",
      description: "note",
      startsAt: "2026-09-01",
    });
  });

  it("throws 503 when api key missing", async () => {
    configValues["catalog.ticketmasterApiKey"] = "";
    await expect(client.search("x")).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it("throws BadGateway on upstream/network errors", async () => {
    http.fetch.mockResolvedValue(mockResponse(502, {}));
    await expect(client.search("x")).rejects.toBeInstanceOf(BadGatewayException);

    http.fetch.mockRejectedValue(new Error("network"));
    await expect(client.search("x")).rejects.toBeInstanceOf(BadGatewayException);
  });

  it("throws NotFound on detail 404", async () => {
    http.fetch.mockResolvedValue(mockResponse(404, {}));
    await expect(client.getByExternalId("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
