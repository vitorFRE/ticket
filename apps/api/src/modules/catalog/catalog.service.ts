import { BadRequestException, Injectable } from "@nestjs/common";
import { TicketmasterClient } from "./clients/ticketmaster.client";
import { TmdbClient } from "./clients/tmdb.client";
import {
  type CatalogItem,
  type CatalogSearchResult,
  type CatalogSource,
  isCatalogSource,
} from "./types/catalog-item.type";

@Injectable()
export class CatalogService {
  constructor(
    private readonly tmdb: TmdbClient,
    private readonly ticketmaster: TicketmasterClient,
  ) {}

  searchTmdb(query: string): Promise<CatalogSearchResult> {
    return this.tmdb.search(query);
  }

  searchTicketmaster(query: string): Promise<CatalogSearchResult> {
    return this.ticketmaster.search(query);
  }

  async getDetail(source: string, externalId: string): Promise<CatalogItem> {
    if (!isCatalogSource(source)) {
      throw new BadRequestException(
        "source inválido. Use tmdb ou ticketmaster",
      );
    }

    return this.getBySource(source, externalId);
  }

  private getBySource(
    source: CatalogSource,
    externalId: string,
  ): Promise<CatalogItem> {
    if (source === "tmdb") {
      return this.tmdb.getByExternalId(externalId);
    }
    return this.ticketmaster.getByExternalId(externalId);
  }
}
