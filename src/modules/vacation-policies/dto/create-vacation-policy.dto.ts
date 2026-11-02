import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { VacationPolicyStatus, VacationCycleType, VacationDayBasis } from "@prisma/client";
import { CreateVacationPolicyRuleDto } from "./create-vacation-policy-rule.dto";

export class CreateVacationPolicyDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  countryCode!: string;

  @IsString()
  regimeCode!: string;

  // El estado inicial de una política siempre es DRAFT; la activación es un
  // flujo aparte que exige validación de RR.HH. Se acepta por compatibilidad
  // pero el servicio lo fuerza a DRAFT al crear.
  @IsOptional()
  @IsEnum(VacationPolicyStatus)
  status?: VacationPolicyStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;

  @IsDateString()
  effectiveFrom!: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsEnum(VacationCycleType)
  cycleType!: VacationCycleType;

  @IsInt()
  @Min(1)
  @Max(12)
  cycleStartMonth!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  cycleStartDay!: number;

  // Obligatorio: método de cómputo de días (sin default)
  @IsEnum(VacationDayBasis)
  dayBasis!: VacationDayBasis;

  @IsOptional()
  @IsBoolean()
  carryForwardEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCarryForwardDays?: number;

  @IsOptional()
  @IsInt()
  carryForwardExpiryMonths?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minNoticeDays?: number;

  @IsOptional()
  @IsBoolean()
  allowPartialDays?: boolean;

  @IsOptional()
  @IsBoolean()
  allowSplitting?: boolean;

  @IsOptional()
  @IsInt()
  maxRequestsPerCycle?: number;

  @IsOptional()
  @IsBoolean()
  reserveOnSubmit?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresHrApproval?: boolean;

  // Referencia legal configurable (ej. art. 177 Código de Trabajo DO).
  // Solo informativo: nunca se siembran valores legales como reglas activas.
  @IsOptional()
  @IsString()
  legalReference?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVacationPolicyRuleDto)
  rules?: CreateVacationPolicyRuleDto[];
}
