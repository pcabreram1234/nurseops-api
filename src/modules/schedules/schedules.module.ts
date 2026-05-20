import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { SchedulesController } from "./controllers/schedules.controller";
import { SchedulesPublicationController } from "./controllers/schedule-publication.controller";

import { SchedulesService } from "./services/schedules.service";
import { SchedulePublicationService } from "./services/schedule-publication.service";

@Module({
  imports: [PrismaModule],

  controllers: [SchedulesController, SchedulesPublicationController],

  providers: [SchedulesService, SchedulePublicationService],

  exports: [SchedulesService, SchedulePublicationService],
})
export class SchedulesModule {}
