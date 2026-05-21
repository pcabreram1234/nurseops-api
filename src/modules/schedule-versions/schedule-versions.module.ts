import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { ScheduleVersionsController } from "./controllers/schedule-versions.controller";

import { ScheduleVersionsService } from "./services/schedule-versions.service";

import { ScheduleSnapshotService } from "./services/schedule-snapshot.service";

import { ScheduleRollbackService } from "./services/schedule-rollback.service";

import { VersionComparisonService } from "./services/version-comparison.service";

import { VersionPublishingService } from "./services/version-publishing.service";

import { ScheduleVersionValidator } from "./validators/schedule-version.validator";

import { RollbackValidator } from "./validators/rollback.validator";

import { SnapshotIntegrityValidator } from "./validators/snapshot-integrity.validator";

import { ScheduleVersionListener } from "./listeners/schedule-version.listener";

@Module({
  imports: [PrismaModule],

  controllers: [ScheduleVersionsController],

  providers: [
    ScheduleVersionsService,

    ScheduleSnapshotService,

    ScheduleRollbackService,

    VersionComparisonService,

    VersionPublishingService,

    /*
    |--------------------------------------------------------------------------
    | VALIDATORS
    |--------------------------------------------------------------------------
    */

    ScheduleVersionValidator,

    RollbackValidator,

    SnapshotIntegrityValidator,

    /*
    |--------------------------------------------------------------------------
    | LISTENERS
    |--------------------------------------------------------------------------
    */

    ScheduleVersionListener,
  ],

  exports: [
    ScheduleVersionsService,

    ScheduleSnapshotService,

    ScheduleRollbackService,
  ],
})
export class ScheduleVersionsModule {}
