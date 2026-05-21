import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { WorkRuleActionsController } from "@modules/work-rule-actions/controllers/work-rule-actions.controller";

import { WorkRuleActionsService } from "./services/work-rule-actions.service";

import { ActionEngineService } from "./services/action-engine.service";

import { ActionDispatcherService } from "./services/action-dispatcher.service";

import { ActionRegistryService } from "./services/action-registry.service";

import { ActionExecutorService } from "./services/action-executor.service";

import { ActionBuilderService } from "./services/action-builder.service";

import { WorkRuleActionListener } from "./listeners/work-rule-action.listener";

import { BlockAssignmentHandler } from "@modules/work-rule-actions/handler/block-assignment.handler";

import { SendAlertHandler } from "@modules/work-rule-actions/handler/send-alert.handler";

import { AutoReassignHandler } from "@modules/work-rule-actions/handler/auto-reassign.handler";

import { NotifySupervisorHandler } from "@modules/work-rule-actions/handler/notify-supervisor.handler";

import { CreateIncidentHandler } from "@modules/work-rule-actions/handler/create-incident.handler";

@Module({
  imports: [PrismaModule],

  controllers: [WorkRuleActionsController],

  providers: [
    WorkRuleActionsService,

    ActionEngineService,

    ActionDispatcherService,

    ActionRegistryService,

    ActionExecutorService,

    ActionBuilderService,

    WorkRuleActionListener,

    BlockAssignmentHandler,

    SendAlertHandler,

    AutoReassignHandler,

    NotifySupervisorHandler,

    CreateIncidentHandler,
  ],

  exports: [WorkRuleActionsService, ActionExecutorService],
})
export class WorkRuleActionsModule {}
