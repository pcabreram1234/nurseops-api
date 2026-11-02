import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export enum GeneratedDocumentStatusFilter {
  GENERATED = "GENERATED",
  SUBSTITUTED = "SUBSTITUTED",
  VOID = "VOID",
}

export class DocumentFilterDto {
  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsEnum(GeneratedDocumentStatusFilter)
  status?: GeneratedDocumentStatusFilter;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 25;
}
