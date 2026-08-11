import { IsIn, IsOptional, IsString, MinLength } from "class-validator";
import {
  CATALOG_SOURCES,
  type CatalogSource,
} from "../../catalog/types/catalog-item.type";

export class ListEventsQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  q?: string;

  @IsOptional()
  @IsIn(CATALOG_SOURCES)
  source?: CatalogSource;
}
