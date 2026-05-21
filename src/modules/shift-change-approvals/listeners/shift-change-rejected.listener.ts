import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ApprovalRejectedEvent } from '../events/approval-rejected.event';
import { APPROVAL_EVENTS } from '../constants/shift-change-approvals.constants';

@Injectable()
export class ShiftChangeRejectedListener {
  @OnEvent(APPROVAL_EVENTS.REJECTED)
  handleShiftChangeRejected(event: ApprovalRejectedEvent) {
    console.log(`[EVENT_LISTENER]: Application ${event.approvalId} rejected by reason: "${event.reason}".`);
  }
}