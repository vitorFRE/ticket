import { IsEnum } from "class-validator";

export enum PayOutcome {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export class PayReservationDto {
  @IsEnum(PayOutcome)
  outcome: PayOutcome;
}
