import {
  IsBoolean,
  IsInt,
  IsJSON,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateShiftTemplateDto {
  @IsString()
  organizationId!: string;

  @IsString()
  departmentId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsJSON()
  configuration: any;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  autoAssignable?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;
}
