import { Injectable } from '@nestjs/common';
import { IApprovalValidator } from '../interfaces/approval-validator.interface';
import { ApprovalContext } from '../interfaces/approval-context.interface';
import { ApprovalResult } from '../interfaces/approval-result.interface';
import { ApprovalStatus } from '../enums/approval-status.enum';

@Injectable()
export class ApprovalExpirationValidator implements IApprovalValidator {
  async validate(approval: any, _context: ApprovalContext): Promise<ApprovalResult> {
    const now = new Date();
    if (approval.expiresAt && now > new Date(approval.expiresAt) && approval.status === ApprovalStatus.PENDING) {
      return { valid: false, code: 'APPROVAL_EXPIRED', severity: 'HIGH', message: 'The request has temporarily expired.' };
    }
    return { valid: true };
  }
}