import { IsOptional, IsEnum, IsUUID } from "class-validator";
import { ApprovalStatus } from "../enums/approval-status.enum";

export class ShiftChangeApprovalFilterDto {
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsUUID("4")
  requestingNurseId?: string;
}
