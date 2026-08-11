import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { InventoryMode } from "../../../generated/prisma/enums";
import { TransformGateHours } from "./gate-hours";

export class SeatMapConfigDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  rows?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  seatsPerRow?: number;
}

export class SectorInputDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  capacity: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  priceCents?: number;
}

export class CreateEventDto {
  @IsString()
  @MinLength(1)
  source: string;

  @IsString()
  @MinLength(1)
  externalId: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

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

  @IsInt()
  @Min(0)
  @Type(() => Number)
  priceCents: number;

  @IsEnum(InventoryMode)
  inventoryMode: InventoryMode;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ValidateIf((o: CreateEventDto) => o.inventoryMode === InventoryMode.SEAT_MAP)
  @IsOptional()
  @ValidateNested()
  @Type(() => SeatMapConfigDto)
  seatMap?: SeatMapConfigDto;

  @ValidateIf(
    (o: CreateEventDto) => o.inventoryMode === InventoryMode.GA_SECTOR,
  )
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SectorInputDto)
  sectors?: SectorInputDto[];
}
