import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { WorkRuleConditionsController } from "./controllers/work-rule-conditions.controller";

import { WorkRuleConditionsService } from "./services/work-rule-conditions.service";

import { ConditionEngineService } from "./services/condition-engine.service";

import { ConditionParserService } from "./services/condition-parser.service";

import { ConditionEvaluatorService } from "./services/condition-evaluator.service";

import { ConditionBuilderService } from "./services/condition-builder.service";

import { ConditionOperatorValidator } from "./validators/condition-operator.validator";

import { ConditionValueValidator } from "./validators/condition-value.validator";

@Module({
  imports: [PrismaModule],

  controllers: [WorkRuleConditionsController],

  providers: [
    WorkRuleConditionsService,

    ConditionEngineService,

    ConditionParserService,

    ConditionEvaluatorService,

    ConditionBuilderService,

    /*
    |--------------------------------------------------------------------------
    | VALIDATORS
    |--------------------------------------------------------------------------
    */

    ConditionOperatorValidator,

    ConditionValueValidator,
  ],

  exports: [WorkRuleConditionsService, ConditionEngineService],
})
export class WorkRuleConditionsModule {}
