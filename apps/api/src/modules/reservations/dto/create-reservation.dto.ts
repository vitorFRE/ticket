import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateIf,
} from "class-validator";

export class CreateReservationDto {
  @IsUUID()
  eventId: string;

  @ValidateIf((o: CreateReservationDto) => !o.sectorId)
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  seatIds?: string[];

  @ValidateIf((o: CreateReservationDto) => !o.seatIds?.length)
  @IsUUID()
  sectorId?: string;

  @ValidateIf((o: CreateReservationDto) => !!o.sectorId)
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity?: number;
}
