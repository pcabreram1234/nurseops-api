import { IsString, IsOptional, IsDateString } from "class-validator";

export class SimulateVacationDto {
  @IsString()
  nurseId!: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}
