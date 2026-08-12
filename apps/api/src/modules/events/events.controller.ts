import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import type { JwtPayload } from "../../common/types/jwt-payload.type";
import { UserRole } from "../../generated/prisma/enums";
import { CreateEventDto } from "./dto/create-event.dto";
import { ListEventTicketsQueryDto } from "./dto/list-event-tickets.query.dto";
import { ListEventsQueryDto } from "./dto/list-events.query.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { EventMetricsService } from "./event-metrics.service";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly metricsService: EventMetricsService,
  ) {}

  @Public()
  @Get()
  list(@Query() query: ListEventsQueryDto) {
    return this.eventsService.listPublished({
      q: query.q,
      source: query.source,
      from: query.from,
      to: query.to,
      priceMin: query.priceMin,
      priceMax: query.priceMax,
      venue: query.venue,
    });
  }

  @Get("mine")
  @Roles(UserRole.ORGANIZER)
  listMine(@CurrentUser("sub") organizerId: string) {
    return this.eventsService.listMine(organizerId);
  }

  @Post()
  @Roles(UserRole.ORGANIZER)
  create(@CurrentUser("sub") organizerId: string, @Body() dto: CreateEventDto) {
    return this.eventsService.create(organizerId, dto);
  }

  @Public()
  @Get(":id/seats")
  listSeats(@Param("id") id: string, @CurrentUser() user?: JwtPayload) {
    return this.eventsService.listSeats(id, user ?? null);
  }

  @Public()
  @Get(":id/sectors")
  listSectors(@Param("id") id: string, @CurrentUser() user?: JwtPayload) {
    return this.eventsService.listSectors(id, user ?? null);
  }

  @Get(":id/stats")
  @Roles(UserRole.ORGANIZER)
  getStats(
    @Param("id") id: string,
    @CurrentUser("sub") organizerId: string,
  ) {
    return this.metricsService.getEventStats(id, organizerId);
  }

  @Get(":id/tickets")
  @Roles(UserRole.ORGANIZER)
  listTickets(
    @Param("id") id: string,
    @CurrentUser("sub") organizerId: string,
    @Query() query: ListEventTicketsQueryDto,
  ) {
    return this.metricsService.listEventTickets(
      id,
      organizerId,
      query.limit ?? 50,
    );
  }

  @Post(":id/publish")
  @Roles(UserRole.ORGANIZER)
  publish(@Param("id") id: string, @CurrentUser("sub") organizerId: string) {
    return this.eventsService.publish(id, organizerId);
  }

  @Patch(":id")
  @Roles(UserRole.ORGANIZER)
  update(
    @Param("id") id: string,
    @CurrentUser("sub") organizerId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, organizerId, dto);
  }

  @Public()
  @Get(":id")
  getById(@Param("id") id: string, @CurrentUser() user?: JwtPayload) {
    return this.eventsService.getById(id, user ?? null);
  }
}
