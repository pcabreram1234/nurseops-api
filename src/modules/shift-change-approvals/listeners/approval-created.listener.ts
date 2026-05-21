import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ApprovalCreatedEvent } from '../events/approval-created.event';
import { APPROVAL_EVENTS } from '../constants/shift-change-approvals.constants';

@Injectable()
export class ApprovalCreatedListener {
  @OnEvent(APPROVAL_EVENTS.CREATED)
  handleApprovalCreated(event: ApprovalCreatedEvent) {
    console.log(`[EVENT_LISTENER]: Application ${event.approvalId} created for the organization ${event.organizationId}.`);
    // Aquí puedes ligar flujos externos, ej: Enviar correos masivos vía SendGrid
  }
}