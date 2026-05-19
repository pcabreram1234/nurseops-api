import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { OptimizationScoresController } from "./controller/optimization-scores.controller";

import { OptimizationScoresService } from "./services/optimization-scores.service";

@Module({
  imports: [PrismaModule],

  controllers: [OptimizationScoresController],

  providers: [OptimizationScoresService],

  exports: [OptimizationScoresService],
})
export class OptimizationScoresModule {}
