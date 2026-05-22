import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '@infra/database/prisma.module';

// Controllers
import { OptimizationRunsController } from './controllers/optimization-runs.controller';

// Services
import { OptimizationRunsService } from './services/optimization-runs.service';
import { OptimizationEngineService } from './services/optimization-engine.service';
import { OptimizationScoreService } from './services/optimization-score.service';
import { OptimizationHistoryService } from './services/optimization-history.service';
import { OptimizationConflictService } from './services/optimization-conflict.service';
import { OptimizationAiService } from './services/optimization-ai.service';
import { OptimizationMetricsService } from './services/optimization-metrics.service';
import { OptimizationSnapshotService } from './services/optimization-snapshot.service';
import { OptimizationPerformanceService } from './services/optimization-performance.service';

// Validators
import { OptimizationRulesValidator } from './validators/optimization-rules.validator';
import { OptimizationScoreValidator } from './validators/optimization-score.validator';
import { OptimizationTimeValidator } from './validators/optimization-time.validator';
import { OptimizationConflictValidator } from './validators/optimization-conflict.validator';

// Listeners
import { ScheduleCreatedListener } from './listeners/schedule-created.listener';
import { OptimizationFinishedListener } from './listeners/optimization-finished.listener';
import { OptimizationFailedListener } from './listeners/optimization-failed.listener';
import { OptimizationScoreListener } from './listeners/optimization-score.listener';

// Jobs
import { OptimizationRunJob } from './jobs/optimization-run.job';
import { OptimizationCleanupJob } from './jobs/optimization-cleanup.job';
import { OptimizationAnalysisJob } from './jobs/optimization-analysis.job';
import { OptimizationRetryJob } from './jobs/optimization-retry.job';

@Module({
    imports: [
        PrismaModule,
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
    ],
    controllers: [OptimizationRunsController],
    providers: [
        // Core Operational Services
        OptimizationRunsService,
        OptimizationEngineService,
        OptimizationScoreService,
        OptimizationHistoryService,
        OptimizationConflictService,
        OptimizationAiService,
        OptimizationMetricsService,
        OptimizationSnapshotService,
        OptimizationPerformanceService,

        // Domain Business Validators
        OptimizationRulesValidator,
        OptimizationScoreValidator,
        OptimizationTimeValidator,
        OptimizationConflictValidator,

        // Event Messaging Consumers
        ScheduleCreatedListener,
        OptimizationFinishedListener,
        OptimizationFailedListener,
        OptimizationScoreListener,

        // Cron Automation Engines
        OptimizationRunJob,
        OptimizationCleanupJob,
        OptimizationAnalysisJob,
        OptimizationRetryJob,
    ],
    exports: [
        OptimizationRunsService,
        OptimizationEngineService,
    ],
})
export class OptimizationRunsModule { }