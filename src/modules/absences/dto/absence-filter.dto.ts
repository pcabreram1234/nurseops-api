import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

import { AbsenceStatus, AbsenceType } from "@prisma/client";
import { randomUUID } from "node:crypto";

export class AbsenceFilterDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: "Id de la enfermera", example: randomUUID() })
  nurseId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: "Id de la sede", example: randomUUID() })
  branchId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(AbsenceType)
  @ApiProperty({ description: "Tipo de ausencia", enum: AbsenceType })
  type?: AbsenceType;

  @IsOptional()
  @IsEnum(AbsenceStatus)
  @ApiProperty({ description: "Estatus de la ausencia", enum: AbsenceStatus })
  status?: AbsenceStatus;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: "Fecha de inicio de la ausencia", format: "date-time", default: new Date().toISOString() })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

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
