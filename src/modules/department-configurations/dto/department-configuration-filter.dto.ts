import { IsOptional, IsString } from "class-validator";

export class DepartmentConfigurationFilterDto {
  @IsOptional()
  @IsString()
  departmentId?: string;
}
