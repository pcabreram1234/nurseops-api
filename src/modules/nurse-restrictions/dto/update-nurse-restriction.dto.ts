import { IsOptional, IsBoolean, IsDateString, IsString } from "class-validator";

export class UpdateNurseRestrictionDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isTemporary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
