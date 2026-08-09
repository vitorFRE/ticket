import {
  BadGatewayException,
  BadRequestException,
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

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const SEARCH_LIMIT = 20;

type TmdbMultiResult = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
};

type TmdbSearchResponse = {
  results?: TmdbMultiResult[];
};

type TmdbDetail = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
};

@Injectable()
export class TmdbClient {
  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpFetcher,
  ) {}

  async search(query: string): Promise<CatalogSearchResult> {
    const url = new URL(`${TMDB_BASE}/search/multi`);
    url.searchParams.set("query", query);
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("language", "pt-BR");

    const data = await this.requestJson<TmdbSearchResponse>(url);
    const items = (data.results ?? [])
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .slice(0, SEARCH_LIMIT)
      .map((item) => this.mapResult(item));

    return { items };
  }

  async getByExternalId(externalId: string): Promise<CatalogItem> {
    const { mediaType, id } = this.parseExternalId(externalId);
    const url = new URL(`${TMDB_BASE}/${mediaType}/${id}`);
    url.searchParams.set("language", "pt-BR");

    const data = await this.requestJson<TmdbDetail>(url, { notFoundAs404: true });
    return this.mapDetail(data, mediaType);
  }

  parseExternalId(externalId: string): { mediaType: "movie" | "tv"; id: string } {
    const [mediaType, id, ...rest] = externalId.split(":");
    if (
      rest.length > 0 ||
      (mediaType !== "movie" && mediaType !== "tv") ||
      !id ||
      !/^\d+$/.test(id)
    ) {
      throw new BadRequestException(
        "externalId TMDb inválido. Use movie:{id} ou tv:{id}",
      );
    }
    return { mediaType, id };
  }

  private mapResult(item: TmdbMultiResult): CatalogItem {
    const mediaType = item.media_type as "movie" | "tv";
    return {
      source: "tmdb",
      externalId: `${mediaType}:${item.id}`,
      title: item.title ?? item.name ?? "Sem título",
      description: item.overview?.trim() ? item.overview : null,
      imageUrl: item.poster_path
        ? `${TMDB_IMAGE_BASE}${item.poster_path}`
        : null,
      venue: null,
      startsAt: null,
      raw: {
        id: item.id,
        media_type: mediaType,
        title: item.title ?? item.name,
        overview: item.overview,
        poster_path: item.poster_path,
      },
    };
  }

  private mapDetail(item: TmdbDetail, mediaType: "movie" | "tv"): CatalogItem {
    return {
      source: "tmdb",
      externalId: `${mediaType}:${item.id}`,
      title: item.title ?? item.name ?? "Sem título",
      description: item.overview?.trim() ? item.overview : null,
      imageUrl: item.poster_path
        ? `${TMDB_IMAGE_BASE}${item.poster_path}`
        : null,
      venue: null,
      startsAt: null,
      raw: {
        id: item.id,
        media_type: mediaType,
        title: item.title ?? item.name,
        overview: item.overview,
        poster_path: item.poster_path,
      },
    };
  }

  private resolveAuth(): { apiKey?: string; bearer?: string } {
    const apiKey = this.config.get<string>("catalog.tmdbApiKey")?.trim();
    const bearer = this.config.get<string>("catalog.tmdbAccessToken")?.trim();
    if (apiKey) return { apiKey };
    if (bearer) return { bearer };
    throw new ServiceUnavailableException(
      "TMDb não configurado. Defina TMDB_API_KEY ou TMDB_ACCESS_TOKEN",
    );
  }

  private async requestJson<T>(
    url: URL,
    opts?: { notFoundAs404?: boolean },
  ): Promise<T> {
    const auth = this.resolveAuth();
    if (auth.apiKey) url.searchParams.set("api_key", auth.apiKey);

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (auth.bearer) headers.Authorization = `Bearer ${auth.bearer}`;

    let response: Response;
    try {
      response = await this.http.fetch(url.toString(), { headers });
    } catch {
      throw new BadGatewayException("Falha ao contatar TMDb");
    }

    if (opts?.notFoundAs404 && response.status === 404) {
      throw new NotFoundException("Item TMDb não encontrado");
    }

    if (!response.ok) {
      throw new BadGatewayException(
        `TMDb retornou erro HTTP ${response.status}`,
      );
    }

    return (await response.json()) as T;
  }
}
