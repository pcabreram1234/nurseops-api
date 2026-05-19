import { IsOptional, IsUUID } from "class-validator";

export class NursePreferenceFilterDto {
  @IsOptional()
  @IsUUID()
  userId?: string;
}
