import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

import { PriorityTypes } from "@prisma/client";

export class CreateEmergencyCoverageDto {
  @IsString()
  organizationId!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  /**
   * Sede de la cobertura. Obligatoria a nivel de base de datos; si no se envía
   * se deriva del departamento o del turno.
   */
  @IsOptional()
  @IsString()
  branchId?: string;

  @IsString()
  shiftId!: string;

  @IsString()
  nurseId!: string;

  @IsDateString()
  date!: Date;

  @IsEnum(PriorityTypes)
  priority!: PriorityTypes;
}
