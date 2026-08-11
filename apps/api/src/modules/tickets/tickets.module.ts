import { Module } from "@nestjs/common";
import { PublicTicketsController } from "./public-tickets.controller";
import { TicketQrService } from "./ticket-qr.service";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";

@Module({
  controllers: [TicketsController, PublicTicketsController],
  providers: [TicketsService, TicketQrService],
  exports: [TicketsService, TicketQrService],
})
export class TicketsModule {}
