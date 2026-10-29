import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateShiftTemplateDto {
  @IsString()
  organizationId!: string;

  @IsString()
  branchId!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  configuration?: any;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsInt()
  @Min(1)
  durationHours!: number;

  @IsBoolean()
  isNightShift!: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  minimum_staff?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  autoAssignable?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;
}