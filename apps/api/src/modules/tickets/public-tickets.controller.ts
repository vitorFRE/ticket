import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { TicketsService } from "./tickets.service";

@ApiTags("tickets")
@Controller("public/tickets")
export class PublicTicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Public()
  @Get(":token")
  getByToken(@Param("token") token: string) {
    return this.ticketsService.getPublicByToken(token);
  }
}
