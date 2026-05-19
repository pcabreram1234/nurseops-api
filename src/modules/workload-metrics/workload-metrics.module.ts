import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { WorkloadMetricsController } from "./controllers/workload-metrics.controller";

import { WorkloadMetricsService } from "./services/workload-metrics.service";

@Module({
  imports: [PrismaModule],

  controllers: [WorkloadMetricsController],

  providers: [WorkloadMetricsService],

  exports: [WorkloadMetricsService],
})
export class WorkloadMetricsModule {}
