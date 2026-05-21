import { ApprovalContext } from "./approval-context.interface";
import { ApprovalResult } from "./approval-result.interface";

export interface IApprovalValidator {
  validate(approval: any, context: ApprovalContext): Promise<ApprovalResult>;
}
