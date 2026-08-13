import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../generated/prisma/enums";
import { TicketsService } from "./tickets.service";

@ApiTags("tickets")
@Controller("tickets")
@Roles(UserRole.CLIENT)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get("mine")
  listMine(@CurrentUser("sub") userId: string) {
    return this.ticketsService.listMine(userId);
  }

  @Get(":id")
  getById(@Param("id") id: string, @CurrentUser("sub") userId: string) {
    return this.ticketsService.getById(id, userId);
  }

  @Post(":id/share")
  share(@Param("id") id: string, @CurrentUser("sub") userId: string) {
    return this.ticketsService.share(id, userId);
  }
}
