import { IsBoolean, IsInt, IsString, Min } from "class-validator";

export class CreateDepartmentConfigurationDto {
  @IsString()
  organizationId!: string;

  @IsString()
  departmentId!: string;

  @IsInt()
  @Min(0)
  max_nights!: number;

  @IsInt()
  @Min(1)
  minimum_staff_per_shift!: number;

  @IsBoolean()
  allow_external_support!: boolean;

  @IsBoolean()
  allow_double_shift!: boolean;
}
