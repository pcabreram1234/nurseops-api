import {
  IsOptional,
  IsBoolean,
  IsDateString,
  IsString,
} from "class-validator";

export class CreateNurseRestrictionDto {
  @IsString()
  nurseId!: string;

  @IsString()
  restrictionTypeId!: string;

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

  @IsString()
  organizationId!: string

  @IsBoolean()
  isActive!: boolean
}
