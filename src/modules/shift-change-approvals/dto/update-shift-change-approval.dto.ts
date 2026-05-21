import { PartialType } from "@nestjs/mapped-types";
import { CreateShiftChangeApprovalDto } from "./create-shift-change-approval.dto";

export class UpdateShiftChangeApprovalDto extends PartialType(
  CreateShiftChangeApprovalDto,
) {}
