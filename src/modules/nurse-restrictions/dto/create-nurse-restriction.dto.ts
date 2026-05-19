import {
  IsUUID,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsString,
} from "class-validator";

export class CreateNurseRestrictionDto {
  @IsUUID()
  nurseId!: string;

  @IsUUID()
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
}
