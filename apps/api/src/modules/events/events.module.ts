import { Module } from "@nestjs/common";
import { CatalogModule } from "../catalog/catalog.module";
import { ReservationsModule } from "../reservations/reservations.module";
import { EventMetricsService } from "./event-metrics.service";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { InventoryService } from "./inventory.service";

@Module({
  imports: [CatalogModule, ReservationsModule],
  controllers: [EventsController],
  providers: [EventsService, InventoryService, EventMetricsService],
  exports: [EventsService],
})
export class EventsModule {}
