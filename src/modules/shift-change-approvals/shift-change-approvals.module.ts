import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ShiftChangeApprovalsController } from './controllers/shift-change-approvals.controller';
import { ShiftChangeApprovalsService } from './services/shift-change-approvals.service';
import { ApprovalEngineService } from './services/approval-engine.service';
import { ApprovalFlowService } from './services/approval-flow.service';
import { ApprovalValidatorService } from './services/approval-validator.service';
import { ApprovalAuditService } from './services/approval-audit.service';
import { ApprovalNotificationService } from './services/approval-notification.service';
import { ApprovalAiService } from './services/approval-ai.service';
import { ShiftChangeApprovalsGateway } from './gateways/shift-change-approvals.gateway';

// Validators
import { ApprovalPermissionValidator } from './validators/approval-permission.validator';
import { ApprovalFlowValidator } from './validators/approval-flow.validator';
import { ApprovalExpirationValidator } from './validators/approval-expiration.validator';
import { ApprovalStatusValidator } from './validators/approval-status.validator';

// Listeners
import { ApprovalCreatedListener } from './listeners/approval-created.listener';
import { ShiftChangeApprovedListener } from './listeners/shift-change-approved.listener';
import { ShiftChangeRejectedListener } from './listeners/shift-change-rejected.listener';

// Jobs
import { ExpireApprovalsJob } from './jobs/expire-approvals.job';
import { RemindPendingApprovalsJob } from './jobs/remind-pending-approvals.job';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Soporte para los @Cron Jobs de expiración
  ],
  controllers: [ShiftChangeApprovalsController],
  providers: [
    ShiftChangeApprovalsService,
    ApprovalEngineService,
    ApprovalFlowService,
    ApprovalValidatorService,
    ApprovalAuditService,
    ApprovalNotificationService,
    ApprovalAiService,
    ShiftChangeApprovalsGateway,
    
    // Validators de la cadena
    ApprovalPermissionValidator,
    ApprovalFlowValidator,
    ApprovalExpirationValidator,
    ApprovalStatusValidator,
    
    // Listeners del bus de eventos interno
    ApprovalCreatedListener,
    ShiftChangeApprovedListener,
    ShiftChangeRejectedListener,
    
    // Automatizaciones en background
    ExpireApprovalsJob,
    RemindPendingApprovalsJob,
  ],
  exports: [ShiftChangeApprovalsService, ApprovalEngineService],
})
export class ShiftChangeApprovalsModule {}