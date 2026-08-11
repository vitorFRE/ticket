import { IsString, IsUUID, MinLength } from "class-validator";

export class ValidateGateDto {
  @IsUUID()
  eventId: string;

  @IsString()
  @MinLength(1)
  code: string;
}
