import { Injectable, BadRequestException } from '@nestjs/common';
import { ApprovalPermissionValidator } from '../validators/approval-permission.validator';
import { ApprovalFlowValidator } from '../validators/approval-flow.validator';
import { ApprovalExpirationValidator } from '../validators/approval-expiration.validator';
import { ApprovalStatusValidator } from '../validators/approval-status.validator';
import { ApprovalContext } from '../interfaces/approval-context.interface';
import { RuleEvaluationLog} from '@modules/shift-change-approvals/interfaces/rule-evaluation.interface'; // Definición limpia para evitar never[]

@Injectable()
export class ApprovalValidatorService {
  constructor(
    private readonly permissionVal: ApprovalPermissionValidator,
    private readonly flowVal: ApprovalFlowValidator,
    private readonly expirationVal: ApprovalExpirationValidator,
    private readonly statusVal: ApprovalStatusValidator,
  ) {}

  async runAllValidators(approval: any, context: ApprovalContext): Promise<void> {
    const validators = [this.permissionVal, this.flowVal, this.expirationVal, this.statusVal];
    const validationLogs: { validator: string; valid: boolean; message?: string }[] = [];

    for (const val of validators) {
      const res = await val.validate(approval, context);
      validationLogs.push({ validator: val.constructor.name, valid: res.valid, message: res.message });
      
      if (!res.valid) {
        throw new BadRequestException({
          message: res.message || 'Shift change validation failed.',
          code: res.code,
          severity: res.severity,
          history: validationLogs
        });
      }
    }
  }
}