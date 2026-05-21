import { IsOptional, IsString } from "class-validator";

export class SpecialityFilterDto {
  @IsOptional()
  @IsString()
  search?: string;
}
