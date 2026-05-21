import { IsOptional, IsString } from "class-validator";

export class CancelShiftChangeDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
