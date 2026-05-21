import { Injectable, ForbiddenException } from "@nestjs/common";
import { IApprovalValidator } from "../interfaces/approval-validator.interface";
import { ApprovalContext } from "../interfaces/approval-context.interface";
import { ApprovalResult } from "../interfaces/approval-result.interface";

@Injectable()
export class ApprovalPermissionValidator implements IApprovalValidator {
  async validate(
    approval: any,
    context: ApprovalContext,
  ): Promise<ApprovalResult> {
    const hasPermission =
      context.permissions.includes("APPROVE_SHIFT_CHG") ||
      context.role === "SUPER";
    if (!hasPermission) {
      return {
        valid: false,
        code: "INSUFFICIENT_PERMISSIONS",
        severity: "HIGH",
        message: "You do not have supervisor permissions.",
      };
    }
    return { valid: true };
  }
}
