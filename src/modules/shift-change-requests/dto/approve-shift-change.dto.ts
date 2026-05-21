import { IsOptional, IsString } from "class-validator";

export class ApproveShiftChangeDto {
  @IsOptional()
  @IsString()
  supervisorNotes?: string;
}
