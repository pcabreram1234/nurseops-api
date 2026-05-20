import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { WorkRulesModule } from "@modules/work-rules/work-rules.module";

import { RuleGroupsController } from "./controllers/rule-groups.controller";

import { RuleGroupsService } from "./services/rule-groups.service";

import { RuleGroupAssignmentsService } from "./services/rule-group-assignments.service";

import { RuleGroupEngineService } from "./services/rule-group-engine.service";

import { RuleGroupListener } from "./listeners/rule-group.listener";

@Module({
  imports: [PrismaModule, WorkRulesModule],

  controllers: [RuleGroupsController],

  providers: [
    RuleGroupsService,

    RuleGroupAssignmentsService,

    RuleGroupEngineService,

    RuleGroupListener,
  ],

  exports: [RuleGroupEngineService],
})
export class RuleGroupsModule {}
