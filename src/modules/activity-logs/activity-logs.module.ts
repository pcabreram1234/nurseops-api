import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '@infra/database/prisma.module';

// Controllers
import { ActivityLogsController } from './controllers/activity-logs.controller';

// Services
import { ActivityLogsService } from './services/activity-logs.service';
import { ActivityFeedService } from './services/activity-feed.service';
import { ActivityAnalyticsService } from './services/activity-analytics.service';
import { ActivityStreamService } from './services/activity-stream.service';
import { ActivityBuilderService } from './services/activity-builder.service';
import { ActivityEnrichmentService } from './services/activity-enrichment.service';
import { ActivityCacheService } from './services/activity-cache.service';

// Validators
import { ActivityTypeValidator } from './validators/activity-type.validator';
import { ActivityDetailsValidator } from './validators/activity-details.validator';
import { ActivityUserValidator } from './validators/activity-user.validator';

// Listeners
import { ShiftApprovedListener } from './listeners/shift-approved.listener';
import { SchedulePublishedListener } from './listeners/schedule-published.listener';
import { RuleViolatedListener } from './listeners/rule-violated.listener';
import { EmergencyCoveredListener } from './listeners/emergency-covered.listener';

// Jobs
import { ActivityCleanupJob } from './jobs/activity-cleanup.job';
import { ActivityAggregationJob } from './jobs/activity-aggregation.job';
import { ActivityAnalyticsJob } from './jobs/activity-analytics.job';

@Module({
    imports: [
        PrismaModule,
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
    ],
    controllers: [ActivityLogsController],
    providers: [
        // Core Services
        ActivityLogsService,
        ActivityFeedService,
        ActivityAnalyticsService,
        ActivityStreamService,
        ActivityBuilderService,
        ActivityEnrichmentService,
        ActivityCacheService,

        // Validators
        ActivityTypeValidator,
        ActivityDetailsValidator,
        ActivityUserValidator,

        // Event Bus Observers
        ShiftApprovedListener,
        SchedulePublishedListener,
        RuleViolatedListener,
        EmergencyCoveredListener,

        // Tasks background
        ActivityCleanupJob,
        ActivityAggregationJob,
        ActivityAnalyticsJob,
    ],
    exports: [
        ActivityLogsService,
        ActivityBuilderService,
        ActivityEnrichmentService,
    ],
})
export class ActivityLogsModule { }