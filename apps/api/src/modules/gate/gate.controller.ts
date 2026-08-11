import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { SkipThrottle, Throttle } from "@nestjs/throttler";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { THROTTLE_PRESETS } from "../../common/throttler/throttler.config";
import { UserRole } from "../../generated/prisma/enums";
import { ValidateGateDto } from "./dto/validate-gate.dto";
import { GateService } from "./gate.service";

@Controller("gate")
@Roles(UserRole.GATE)
export class GateController {
  constructor(private readonly gateService: GateService) {}

  @SkipThrottle({ default: true })
  @Throttle({ gate: THROTTLE_PRESETS.gate })
  @Post("validate")
  @HttpCode(HttpStatus.OK)
  validate(
    @Body() dto: ValidateGateDto,
    @CurrentUser("sub") gateUserId: string,
  ) {
    return this.gateService.validate(dto.eventId, dto.code, gateUserId);
  }
}
