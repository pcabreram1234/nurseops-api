import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { MonthlyDistributionRulesController } from "./controllers/monthly-distribution-rules.controller";

import { MonthlyDistributionRulesService } from "./services/monthly-distribution-rules.service";

import { DistributionEngineService } from "./services/distribution-engine.service";

import { BalanceNightsValidator } from "./validators/balance-nights.validator";

import { BalanceWeekendsValidator } from "./validators/balance-weekends.validator";

import { OvertimeDistributionValidator } from "./validators/overtime-distribution.validator";

import { DistributionRuleListener } from "./listeners/distribution-rule.listener";

import { DistributionRegistryService } from "./services/distribution-registry.service";

@Module({
  imports: [PrismaModule],

  controllers: [MonthlyDistributionRulesController],

  providers: [
    MonthlyDistributionRulesService,

    DistributionEngineService,

    DistributionRegistryService,

    BalanceNightsValidator,

    BalanceWeekendsValidator,

    OvertimeDistributionValidator,

    DistributionRuleListener,
  ],

  exports: [MonthlyDistributionRulesService, DistributionEngineService],
})
export class MonthlyDistributionRulesModule {}
