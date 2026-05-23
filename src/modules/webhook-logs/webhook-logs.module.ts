import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '@infra/database/prisma.module';

// Controllers
import { WebhookLogsController } from './controllers/webhook-logs.controller';

// Services
import { WebhookLogsService } from './services/webhook-logs.service';
import { WebhookRetryService } from './services/webhook-retry.service';
import { WebhookSecurityService } from './services/webhook-security.service';
import { WebhookSignatureService } from './services/webhook-signature.service';
import { WebhookMonitoringService } from './services/webhook-monitoring.service';
import { WebhookAnalyticsService } from './services/webhook-analytics.service';
import { WebhookCleanupService } from './services/webhook-cleanup.service';
import { WebhookQueueService } from './services/webhook-queue.service';
import { WebhookReplayService } from './services/webhook-replay.service';

// Validators
import { WebhookPayloadValidator } from './validators/webhook-payload.validator';
import { WebhookSignatureValidator } from './validators/webhook-signature.validator';
import { WebhookOriginValidator } from './validators/webhook-origin.validator';
import { WebhookSizeValidator } from './validators/webhook-size.validator';

// Listeners
import { WebhookFailedListener } from './listeners/webhook-failed.listener';
import { WebhookRetriedListener } from './listeners/webhook-retried.listener';
import { WebhookReceivedListener } from './listeners/webhook-received.listener';
import { WebhookProcessedListener } from './listeners/webhook-processed.listener';

// Jobs
import { WebhookRetryJob } from './jobs/webhook-retry.job';
import { WebhookCleanupJob } from './jobs/webhook-cleanup.job';
import { WebhookMonitoringJob } from './jobs/webhook-monitoring.job';
import { WebhookDeadLetterJob } from './jobs/webhook-dead-letter.job';

@Module({
    imports: [
        PrismaModule,
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
    ],
    controllers: [WebhookLogsController],
    providers: [
        // Core Services
        WebhookLogsService,
        WebhookRetryService,
        WebhookSecurityService,
        WebhookSignatureService,
        WebhookMonitoringService,
        WebhookAnalyticsService,
        WebhookCleanupService,
        WebhookQueueService,
        WebhookReplayService,

        // Structural Domain Validators
        WebhookPayloadValidator,
        WebhookSignatureValidator,
        WebhookOriginValidator,
        WebhookSizeValidator,

        // Event Messaging Subscriptions
        WebhookFailedListener,
        WebhookRetriedListener,
        WebhookReceivedListener,
        WebhookProcessedListener,

        // Automations & Background Tasks
        WebhookRetryJob,
        WebhookCleanupJob,
        WebhookMonitoringJob,
        WebhookDeadLetterJob,
    ],
    exports: [
        WebhookLogsService,
        WebhookRetryService,
    ],
})
export class WebhookLogsModule { }