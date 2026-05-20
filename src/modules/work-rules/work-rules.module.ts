import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { WorkRulesController } from "./controllers/work-rules.controller";

import { WorkRulesService } from "./services/work-rules.service";

import { WorkRuleEngineService } from "./services/work-rule-engine.service";

import { MaxHoursValidator } from "./validators/max-hours.validator";
import { NightShiftsValidator } from "./validators/night-shifts.validator";
import { ConsecutiveDaysValidator } from "./validators/consecutive-days.validator";
import { WorkRuleListener } from "./listeners/work-rule.listener";

@Module({
  imports: [PrismaModule],

  controllers: [WorkRulesController],

  providers: [
    WorkRulesService,

    WorkRuleEngineService,

    MaxHoursValidator,

    NightShiftsValidator,

    ConsecutiveDaysValidator,

    WorkRuleListener,
  ],
  exports: [WorkRulesService, WorkRuleEngineService],
})
export class WorkRulesModule {}
