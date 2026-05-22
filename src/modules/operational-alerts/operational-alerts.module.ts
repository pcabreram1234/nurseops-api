import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '@infra/database/prisma.module';

// Controllers
import { OperationalAlertsController } from './controllers/operational-alerts.controller';

// Services
import { OperationalAlertsService } from './services/operational-alerts.service';
import { AlertDetectionService } from './services/alert-detection.service';
import { AlertEscalationService } from './services/alert-escalation.service';
import { AlertResolutionService } from './services/alert-resolution.service';
import { AlertNotificationService } from './services/alert-notification.service';
import { AlertAnalyticsService } from './services/alert-analytics.service';
import { AlertPriorityService } from './services/alert-priority.service';
import { AlertAiService } from './services/alert-ai.service';
import { AlertRoutingService } from './services/alert-routing.service';

// Validators
import { AlertSeverityValidator } from './validators/alert-severity.validator';
import { AlertDuplicationValidator } from './validators/alert-duplication.validator';
import { AlertRoutingValidator } from './validators/alert-routing.validator';
import { AlertResolutionValidator } from './validators/alert-resolution.validator';

// Listeners
import { SchedulePublishedListener } from './listeners/schedule-published.listener';
import { OvertimeDetectedListener } from './listeners/overtime-detected.listener';
import { EmergencyCoverageFailedListener } from './listeners/emergency-coverage-failed.listener';
import { StaffingShortageListener } from './listeners/staffing-shortage.listener';
import { BurnoutDetectedListener } from './listeners/burnout-detected.listener';

// Jobs
import { AlertCleanupJob } from './jobs/alert-cleanup.job';
import { AlertEscalationJob } from './jobs/alert-escalation.job';
import { AlertMonitoringJob } from './jobs/alert-monitoring.job';
import { UnresolvedAlertsJob } from './jobs/unresolved-alerts.job';

@Module({
    imports: [
        PrismaModule,
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
    ],
    controllers: [OperationalAlertsController],
    providers: [
        // Core Services
        OperationalAlertsService,
        AlertDetectionService,
        AlertEscalationService,
        AlertResolutionService,
        AlertNotificationService,
        AlertAnalyticsService,
        AlertPriorityService,
        AlertAiService,
        AlertRoutingService,

        // Structural Validators
        AlertSeverityValidator,
        AlertDuplicationValidator,
        AlertRoutingValidator,
        AlertResolutionValidator,

        // Cross-Module Observers
        SchedulePublishedListener,
        OvertimeDetectedListener,
        EmergencyCoverageFailedListener,
        StaffingShortageListener,
        BurnoutDetectedListener,

        // Background System Automations
        AlertCleanupJob,
        AlertEscalationJob,
        AlertMonitoringJob,
        UnresolvedAlertsJob,
    ],
    exports: [
        OperationalAlertsService,
        AlertDetectionService,
        AlertEscalationService,
    ],
})
export class OperationalAlertsModule { }