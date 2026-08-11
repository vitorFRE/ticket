import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { throttlerModuleOptions } from "./common/throttler/throttler.config";
import { envConfig } from "./config/env.config";
import { AuthModule } from "./modules/auth/auth.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { EventsModule } from "./modules/events/events.module";
import { GateModule } from "./modules/gate/gate.module";
import { HealthModule } from "./modules/health/health.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { ReservationsModule } from "./modules/reservations/reservations.module";
import { TicketsModule } from "./modules/tickets/tickets.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [envConfig] }),
    ThrottlerModule.forRoot(throttlerModuleOptions),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
    CatalogModule,
    EventsModule,
    ReservationsModule,
    TicketsModule,
    GateModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
