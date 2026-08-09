import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpFetcher } from "../http/http-fetcher";
import type {
  CatalogItem,
  CatalogSearchResult,
} from "../types/catalog-item.type";

const TM_BASE = "https://app.ticketmaster.com/discovery/v2";
const SEARCH_LIMIT = 20;

type TicketmasterImage = { url?: string };
type TicketmasterVenue = { name?: string };
type TicketmasterEvent = {
  id: string;
  name?: string;
  info?: string;
  pleaseNote?: string;
  description?: string;
  images?: TicketmasterImage[];
  dates?: { start?: { dateTime?: string; localDate?: string } };
  _embedded?: { venues?: TicketmasterVenue[] };
};

type TicketmasterSearchResponse = {
  _embedded?: { events?: TicketmasterEvent[] };
};

@Injectable()
export class TicketmasterClient {
  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpFetcher,
  ) {}

  async search(query: string): Promise<CatalogSearchResult> {
    const url = new URL(`${TM_BASE}/events.json`);
    url.searchParams.set("keyword", query);
    url.searchParams.set("size", String(SEARCH_LIMIT));

    const data = await this.requestJson<TicketmasterSearchResponse>(url);
    const items = (data._embedded?.events ?? []).map((event) =>
      this.mapEvent(event),
    );
    return { items };
  }

  async getByExternalId(externalId: string): Promise<CatalogItem> {
    const url = new URL(
      `${TM_BASE}/events/${encodeURIComponent(externalId)}.json`,
    );
    const data = await this.requestJson<TicketmasterEvent>(url, {
      notFoundAs404: true,
    });
    return this.mapEvent(data);
  }

  private mapEvent(event: TicketmasterEvent): CatalogItem {
    const description =
      event.info?.trim() ||
      event.pleaseNote?.trim() ||
      event.description?.trim() ||
      null;
    const venue = event._embedded?.venues?.[0]?.name?.trim() || null;
    const startsAt =
      event.dates?.start?.dateTime ?? event.dates?.start?.localDate ?? null;
    const imageUrl = event.images?.[0]?.url ?? null;

    return {
      source: "ticketmaster",
      externalId: event.id,
      title: event.name ?? "Sem título",
      description,
      imageUrl,
      venue,
      startsAt,
      raw: {
        id: event.id,
        name: event.name,
        info: event.info,
        pleaseNote: event.pleaseNote,
        dates: event.dates,
        venues: event._embedded?.venues,
        images: event.images?.slice(0, 3),
      },
    };
  }

  private resolveApiKey(): string {
    const apiKey = this.config
      .get<string>("catalog.ticketmasterApiKey")
      ?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException(
        "Ticketmaster não configurado. Defina TICKETMASTER_API_KEY",
      );
    }
    return apiKey;
  }

  private async requestJson<T>(
    url: URL,
    opts?: { notFoundAs404?: boolean },
  ): Promise<T> {
    url.searchParams.set("apikey", this.resolveApiKey());

    let response: Response;
    try {
      response = await this.http.fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });
    } catch {
      throw new BadGatewayException("Falha ao contatar Ticketmaster");
    }

    if (opts?.notFoundAs404 && response.status === 404) {
      throw new NotFoundException("Evento Ticketmaster não encontrado");
    }

    if (!response.ok) {
      throw new BadGatewayException(
        `Ticketmaster retornou erro HTTP ${response.status}`,
      );
    }

    return (await response.json()) as T;
  }
}
