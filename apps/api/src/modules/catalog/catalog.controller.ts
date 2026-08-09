import { Controller, Get, Param, Query } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../generated/prisma/enums";
import { CatalogService } from "./catalog.service";
import { CatalogSearchQueryDto } from "./dto/catalog-search.query.dto";

@Controller("catalog")
@Roles(UserRole.ORGANIZER)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get("tmdb/search")
  searchTmdb(@Query() query: CatalogSearchQueryDto) {
    return this.catalogService.searchTmdb(query.q);
  }

  @Get("ticketmaster/search")
  searchTicketmaster(@Query() query: CatalogSearchQueryDto) {
    return this.catalogService.searchTicketmaster(query.q);
  }

  @Get(":source/:externalId")
  getDetail(
    @Param("source") source: string,
    @Param("externalId") externalId: string,
  ) {
    return this.catalogService.getDetail(source, externalId);
  }
}
