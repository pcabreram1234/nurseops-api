import { Injectable } from '@nestjs/common';
import { PrismaClient, ActionAuditLogTypes } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApprovalValidatorService } from './approval-validator.service';
import { ApprovalAuditService } from './approval-audit.service';
import { ApprovalContext } from '../interfaces/approval-context.interface';
import { ApprovalStatus } from '../enums/approval-status.enum';
import { APPROVAL_EVENTS } from '../constants/shift-change-approvals.constants';
import { ApprovalApprovedEvent } from '../events/approval-approved.event';
import { ApprovalRejectedEvent } from '../events/approval-rejected.event';

@Injectable()
export class ApprovalEngineService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly validatorService: ApprovalValidatorService,
    private readonly auditService: ApprovalAuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async processApproval(approvalId: string, action: ActionAuditLogTypes, context: ApprovalContext, commentOrReason: string) {
    const approval = await this.prisma.shiftChangeApprovals.findUnique({
      where: { id: approvalId },
    });

    // 1. Ejecución encadenada de reglas de negocio
    await this.validatorService.runAllValidators(approval, context);

    const finalStatus = action === 'APPROVE' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;

    return await this.prisma.$transaction(async (tx) => {
      const updatedApproval = await tx.shiftChangeApprovals.update({
        where: { id: approvalId },
        // Cast to any because generated Prisma UpdateInput type doesn't include 'status' here
        data: ({
          status: finalStatus,
          processedById: context.userId,
          resolutionComment: commentOrReason,
          processedAt: new Date(),
        } as any),
      });

      // 2. Si es aprobado, realizamos el Swapping (intercambio) real de los enfermeros en el ScheduleEntry
      if (finalStatus === ApprovalStatus.APPROVED) {
        await tx.scheduleEntry.update({
          where: { id: approval?.id },
          data: { nurseId: approval?.requesterId },
        });
        
        this.eventEmitter.emit(APPROVAL_EVENTS.APPROVED, new ApprovalApprovedEvent(approvalId, context.organizationId, context.userId));
      } else {
        this.eventEmitter.emit(APPROVAL_EVENTS.REJECTED, new ApprovalRejectedEvent(approvalId, context.organizationId, commentOrReason));
      }

      await this.auditService.logAction(approvalId, context.userId, action, { commentOrReason });

      return updatedApproval;
    });
  }
}