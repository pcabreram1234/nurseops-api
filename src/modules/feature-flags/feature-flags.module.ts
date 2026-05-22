import { Module, Global } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '@infra/database/prisma.module';

// Controllers
import { FeatureFlagsController } from './controllers/feature-flags.controller';

// Services
import { FeatureFlagsService } from './services/feature-flags.service';
import { FeatureFlagCacheService } from './services/feature-flag-cache.service';
import { FeatureFlagEvaluatorService } from './services/feature-flag-evaluator.service';
import { FeatureRolloutService } from './services/feature-rollout.service';
import { FeatureAuditService } from './services/feature-audit.service';
import { FeatureAnalyticsService } from './services/feature-analytics.service';

// Validators
import { FeatureNameValidator } from './validators/feature-name.validator';
import { FeatureRolloutValidator } from './validators/feature-rollout.validator';
import { FeaturePermissionValidator } from './validators/feature-permission.validator';

// Listeners
import { FeatureEnabledListener } from './listeners/feature-enabled.listener';
import { FeatureDisabledListener } from './listeners/feature-disabled.listener';
import { FeatureRolloutListener } from './listeners/feature-rollout.listener';

// Guards & Jobs
import { FeatureFlagGuard } from './guards/feature-flag.guard';
import { FeatureCleanupJob } from './jobs/feature-cleanup.job';

@Global() // Se marca global para poder inyectar la evaluación en cualquier otro controlador del sistema
@Module({
    imports: [
        PrismaModule,
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
    ],
    controllers: [FeatureFlagsController],
    providers: [
        // Core Engine Services
        FeatureFlagsService,
        FeatureFlagCacheService,
        FeatureFlagEvaluatorService,
        FeatureRolloutService,
        FeatureAuditService,
        FeatureAnalyticsService,

        // Validators
        FeatureNameValidator,
        FeatureRolloutValidator,
        FeaturePermissionValidator,

        // Event Bus Observers
        FeatureEnabledListener,
        FeatureDisabledListener,
        FeatureRolloutListener,

        // Automation Jobs
        FeatureCleanupJob,

        // Guard exportable
        FeatureFlagGuard,
    ],
    exports: [
        FeatureFlagsService,
        FeatureFlagEvaluatorService,
        FeatureFlagGuard,
    ],
})
export class FeatureFlagsModule { }