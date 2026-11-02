import { IsString, IsOptional, IsBoolean, IsDateString } from "class-validator";

export class AssignVacationPolicyDto {
  @IsString()
  nurseId!: string;

  // Opcional: se toma del parámetro de ruta (:id) en el controller
  @IsOptional()
  @IsString()
  policyId?: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
