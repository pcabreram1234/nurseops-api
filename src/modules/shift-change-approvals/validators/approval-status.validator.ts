import { Injectable } from '@nestjs/common';
import { IApprovalValidator } from '../interfaces/approval-validator.interface';
import { ApprovalContext } from '../interfaces/approval-context.interface';
import { ApprovalResult } from '../interfaces/approval-result.interface';
import { ApprovalStatus } from '../enums/approval-status.enum';

@Injectable()
export class ApprovalStatusValidator implements IApprovalValidator {
  async validate(approval: any, _context: ApprovalContext): Promise<ApprovalResult> {
    if (approval.status !== ApprovalStatus.PENDING) {
      return { valid: false, code: 'ALREADY_PROCESSED', severity: 'LOW', message: 'This request has already been processed previously.' };
    }
    return { valid: true };
  }
}