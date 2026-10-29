import { IsOptional, IsString, IsInt, Min, Max, IsEnum, IsDateString } from "class-validator";
import { Type } from "class-transformer";
import { ActionAuditLogTypes } from "@prisma/client";

/**
 * Filtros para la consulta de registros de auditoría (solo lectura).
 */
export class AuditLogFilterDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(ActionAuditLogTypes)
  action?: ActionAuditLogTypes;

  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsOptional()
  @IsString()
  requestId?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
