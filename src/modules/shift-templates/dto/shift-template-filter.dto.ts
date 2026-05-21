import { IsOptional, IsString } from "class-validator";

export class ShiftTemplateFilterDto {
  @IsOptional()
  @IsString()
  departmentId?: string;
}
