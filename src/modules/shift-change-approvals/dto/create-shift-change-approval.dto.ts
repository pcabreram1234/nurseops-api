import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
} from "class-validator";
import { ApprovalLevel } from "../enums/approval-level.enum";

export class CreateShiftChangeApprovalDto {
  @IsUUID("4")
  @IsNotEmpty()
  shiftEntryId!: string;

  @IsUUID("4")
  @IsNotEmpty()
  requestingNurseId!: string;

  @IsUUID("4")
  @IsNotEmpty()
  targetNurseId!: string;

  @IsEnum(ApprovalLevel)
  @IsOptional()
  requiredLevel?: ApprovalLevel = ApprovalLevel.SUPERVISOR;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  comments?: string;
}
