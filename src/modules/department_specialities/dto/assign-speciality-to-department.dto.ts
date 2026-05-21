import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

export class AssignSpecialityToDepartmentDto {
  @IsString()
  departmentId!: string;

  @IsString()
  specialityId!: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  minimum_staff?: number;
}
