import { Type } from "class-transformer";
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from "class-validator";
import { TransformGateHours } from "./gate-hours";

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  venue?: string;

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @TransformGateHours()
  @IsInt()
  @Min(0)
  @Max(48)
  gateOpensHoursBefore?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  priceCents?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}
