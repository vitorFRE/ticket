import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../generated/prisma/enums";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { ReservationsService } from "./reservations.service";

@Controller("reservations")
@Roles(UserRole.CLIENT)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(
    @CurrentUser("sub") userId: string,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.create(userId, dto);
  }

  @Get("mine")
  listMine(@CurrentUser("sub") userId: string) {
    return this.reservationsService.listMine(userId);
  }

  @Get(":id")
  getById(@Param("id") id: string, @CurrentUser("sub") userId: string) {
    return this.reservationsService.getById(id, userId);
  }
}
