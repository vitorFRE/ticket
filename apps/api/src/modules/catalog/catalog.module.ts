import { Module } from "@nestjs/common";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { TicketmasterClient } from "./clients/ticketmaster.client";
import { TmdbClient } from "./clients/tmdb.client";
import { HttpFetcher } from "./http/http-fetcher";

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogService,
    TmdbClient,
    TicketmasterClient,
    HttpFetcher,
  ],
  exports: [CatalogService],
})
export class CatalogModule {}
