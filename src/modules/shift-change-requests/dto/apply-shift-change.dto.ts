import { IsString, IsOptional } from "class-validator";

export class ApplyShiftChangeDto {
  @IsString()
  @IsOptional()
  approverNotes?: string;
}
