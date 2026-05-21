import { IsOptional, IsString } from "class-validator";

export class DepartmentSpecialityFilterDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  specialityId?: string;
}
