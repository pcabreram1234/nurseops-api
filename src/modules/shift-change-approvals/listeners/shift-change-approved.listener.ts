import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ApprovalApprovedEvent } from '../events/approval-approved.event';
import { APPROVAL_EVENTS } from '../constants/shift-change-approvals.constants';
import { ApprovalNotificationService } from '../services/approval-notification.service';

@Injectable()
export class ShiftChangeApprovedListener {
  constructor(private readonly notificationService: ApprovalNotificationService) {}

  @OnEvent(APPROVAL_EVENTS.APPROVED)
  async handleShiftChangeApproved(event: ApprovalApprovedEvent) {
    console.log(`[EVENT_LISTENER]: Shift change ${event.approvalId} successfully materialized.`);
    // Ejecutar lógica asíncrona post-aprobación
  }
}