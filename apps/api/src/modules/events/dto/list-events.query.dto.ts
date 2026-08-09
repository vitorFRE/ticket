import { IsOptional, IsString, MinLength } from "class-validator";

export class ListEventsQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  q?: string;
}
