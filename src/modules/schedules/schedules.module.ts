import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";

import { PrismaModule } from "@infra/database/prisma.module";

import { SchedulesController } from "./controllers/schedules.controller";
import { SchedulesPublicationController } from "./controllers/schedule-publication.controller";

import { SchedulesService } from "./services/schedules.service";
import { SchedulePublicationService } from "./services/schedule-publication.service";
import { ScheduleValidationService } from "./services/schedule-validation.service";
import { ScheduleVersionService } from "./services/schedule-version.service";

@Module({
  imports: [PrismaModule, BullModule.registerQueue({
    name: "notifications",
  }),],

  controllers: [SchedulesController, SchedulesPublicationController],

  providers: [SchedulesService, SchedulePublicationService, ScheduleValidationService, ScheduleVersionService],

  exports: [SchedulesService, SchedulePublicationService, ScheduleValidationService, ScheduleVersionService],
})
export class SchedulesModule { }
