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
import { ListEventsQueryDto } from "./dto/list-events.query.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Get()
  list(@Query() query: ListEventsQueryDto) {
    return this.eventsService.listPublished(query.q, query.source);
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
