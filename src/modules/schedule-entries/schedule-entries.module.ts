import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { ScheduleEntriesController } from "./controllers/schedule-entries.controller";

import { ScheduleEntriesService } from "./services/schedule-entries.service";
import { ScheduleValidationService } from "@modules/schedules/services/schedule-validation.service";

@Module({
  imports: [PrismaModule],

  controllers: [ScheduleEntriesController],

  providers: [ScheduleEntriesService, ScheduleValidationService],

  exports: [ScheduleEntriesService, ScheduleValidationService],
})
export class ScheduleEntriesModule { }
