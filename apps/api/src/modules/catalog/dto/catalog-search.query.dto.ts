import { IsString, MinLength } from "class-validator";

export class CatalogSearchQueryDto {
  @IsString()
  @MinLength(1, { message: "q é obrigatório" })
  q: string;
}
