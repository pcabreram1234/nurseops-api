import { Injectable } from '@nestjs/common';
import { ShiftChangeApprovalsGateway } from '@modules/shift-change-approvals/gateways/shift-change-approvals.gateway';

@Injectable()
export class ApprovalNotificationService {
  constructor(private readonly gateway: ShiftChangeApprovalsGateway) {}

  async notifyCreated(approval: any) {
    this.gateway.server.to(`org_${approval.organizationId}`).emit('approval_created', {
      id: approval.id,
      message: `New shift change request pending review.`,
    });
  }

  async notifyStatusChanged(approval: any, status: string) {
    this.gateway.server.to(`org_${approval.organizationId}`).emit('approval_status_updated', {
      id: approval.id,
      status,
      message: `The shift change request was ${status.toLowerCase()}.`,
    });
  }
}