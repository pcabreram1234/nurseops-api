import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { ProviderList as IntegrationProvider } from "@prisma/client";

export class IntegrationFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(IntegrationProvider)
  provider?: IntegrationProvider;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 25;
}