import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { ScheduleEntriesController } from "./controllers/schedule-entries.controller";

import { ScheduleEntriesService } from "./services/schedule-entries.service";

@Module({
  imports: [PrismaModule],

  controllers: [ScheduleEntriesController],

  providers: [ScheduleEntriesService],

  exports: [ScheduleEntriesService],
})
export class ScheduleEntriesModule {}
