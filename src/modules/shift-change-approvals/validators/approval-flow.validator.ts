import { Injectable } from '@nestjs/common';
import { IApprovalValidator } from '../interfaces/approval-validator.interface';
import { ApprovalContext } from '../interfaces/approval-context.interface';
import { ApprovalResult } from '../interfaces/approval-result.interface';
import { ApprovalLevel } from '../enums/approval-level.enum';

@Injectable()
export class ApprovalFlowValidator implements IApprovalValidator {
  async validate(approval: any, context: ApprovalContext): Promise<ApprovalResult> {
    if (approval.requiredLevel === ApprovalLevel.DEPARTMENT_HEAD && context.role !== 'ADMIN' && context.role !== 'SUPER') {
      return { valid: false, code: 'INVALID_FLOW_LEVEL', severity: 'MEDIUM', message: 'This flow requires the signature of the Head of Department.' };
    }
    return { valid: true };
  }
}