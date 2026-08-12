import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
  MinLength,
  Validate,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
  type ValidationArguments,
} from "class-validator";
import {
  CATALOG_SOURCES,
  type CatalogSource,
} from "../../catalog/types/catalog-item.type";

@ValidatorConstraint({ name: "priceRange", async: false })
class PriceRangeConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const obj = args.object as ListEventsQueryDto;
    if (obj.priceMin === undefined || obj.priceMax === undefined) return true;
    return obj.priceMin <= obj.priceMax;
  }

  defaultMessage() {
    return "priceMin não pode ser maior que priceMax";
  }
}

export class ListEventsQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  q?: string;

  @IsOptional()
  @IsIn(CATALOG_SOURCES)
  source?: CatalogSource;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Validate(PriceRangeConstraint)
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMax?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  venue?: string;
}

export type ListPublishedFilters = {
  q?: string;
  source?: CatalogSource;
  from?: string;
  to?: string;
  priceMin?: number;
  priceMax?: number;
  venue?: string;
};
