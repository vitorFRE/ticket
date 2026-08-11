import { Controller, Get, Param } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { TicketsService } from "./tickets.service";

@Controller("public/tickets")
export class PublicTicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Public()
  @Get(":token")
  getByToken(@Param("token") token: string) {
    return this.ticketsService.getPublicByToken(token);
  }
}
