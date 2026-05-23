import { IsOptional, IsUUID, IsEnum, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { AbsenceStatus, AbsenceType } from "@prisma/client";
import { randomUUID } from "node:crypto";

export class AbsenceFilterDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({ description: "Id de la enfermera", example: randomUUID() })
  nurseId?: string;

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
}
