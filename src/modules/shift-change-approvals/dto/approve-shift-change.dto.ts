import { IsString, IsOptional } from "class-validator";

export class ApproveShiftChangeDto {
  @IsString()
  @IsOptional()
  comment?: string;
}
