import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '@infra/database/prisma.module';

// Controllers
import { WorkloadMetricsController } from './controllers/workload-metrics.controller';

// Services
import { WorkloadMetricsService } from './services/workload-metrics.service';
import { WorkloadCalculationService } from './services/workload-calculation.service';
import { FatigueScoreService } from './services/fatigue-score.service';
import { FairnessScoreService } from './services/fairness-score.service';
import { BurnoutRiskService } from './services/burnout-risk.service';
import { WorkloadAnalyticsService } from './services/workload-analytics.service';
import { WorkloadAggregationService } from './services/workload-aggregation.service';
import { WorkloadAiService } from './services/workload-ai.service';
import { WorkloadCacheService } from './services/workload-cache.service';
import { WorkloadAlertService } from './services/workload-alert.service';

// Validators
import { OvertimeLimitValidator } from './validators/overtime-limit.validator';
import { FatigueThresholdValidator } from './validators/fatigue-threshold.validator';
import { FairnessThresholdValidator } from './validators/fairness-threshold.validator';
import { BurnoutThresholdValidator } from './validators/burnout-threshold.validator';
import { WorkloadBalanceValidator } from './validators/workload-balance.validator';

// Listeners
import { ShiftCompletedListener } from './listeners/shift-completed.listener';
import { OvertimeDetectedListener } from './listeners/overtime-detected.listener';
import { SchedulePublishedListener } from './listeners/schedule-published.listener';
import { EmergencyCoveredListener } from './listeners/emergency-covered.listener';

// Jobs
import { WorkloadRecalculationJob } from './jobs/workload-recalculation.job';
import { BurnoutAnalysisJob } from './jobs/burnout-analysis.job';
import { MonthlyAggregationJob } from './jobs/monthly-aggregation.job';
import { WorkloadCleanupJob } from './jobs/workload-cleanup.job';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [WorkloadMetricsController],
  providers: [
    // Core Services
    WorkloadMetricsService,
    WorkloadCalculationService,
    FatigueScoreService,
    FairnessScoreService,
    BurnoutRiskService,
    WorkloadAnalyticsService,
    WorkloadAggregationService,
    WorkloadAiService,
    WorkloadCacheService,
    WorkloadAlertService,

    // Structural Validators
    OvertimeLimitValidator,
    FatigueThresholdValidator,
    FairnessThresholdValidator,
    BurnoutThresholdValidator,
    WorkloadBalanceValidator,

    // Internal Events Subscriptions
    ShiftCompletedListener,
    OvertimeDetectedListener,
    SchedulePublishedListener,
    EmergencyCoveredListener,

    // Background System Automations
    WorkloadRecalculationJob,
    BurnoutAnalysisJob,
    MonthlyAggregationJob,
    WorkloadCleanupJob,
  ],
  exports: [
    WorkloadMetricsService,
    WorkloadCalculationService,
    WorkloadAggregationService,
  ],
})
export class WorkloadMetricsModule { }