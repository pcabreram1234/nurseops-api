import { Injectable } from "@nestjs/common";

import { BlockAssignmentHandler } from "@modules/work-rule-actions/handler/block-assignment.handler";

import { SendAlertHandler } from "@modules/work-rule-actions/handler/send-alert.handler";

import { AutoReassignHandler } from "@modules/work-rule-actions/handler/auto-reassign.handler";

import { NotifySupervisorHandler } from "@modules/work-rule-actions/handler/notify-supervisor.handler";

import { CreateIncidentHandler } from "@modules/work-rule-actions/handler/create-incident.handler";

@Injectable()
export class ActionRegistryService {
  private handlers: Map<string, any> = new Map();

  constructor(
    private readonly blockAssignmentHandler: BlockAssignmentHandler,

    private readonly sendAlertHandler: SendAlertHandler,

    private readonly autoReassignHandler: AutoReassignHandler,

    private readonly notifySupervisorHandler: NotifySupervisorHandler,

    private readonly createIncidentHandler: CreateIncidentHandler,
  ) {
    this.handlers.set("BLOCK_ASSIGNMENT", this.blockAssignmentHandler);

    this.handlers.set("SEND_ALERT", this.sendAlertHandler);

    this.handlers.set("AUTO_REASSIGN", this.autoReassignHandler);

    this.handlers.set("NOTIFY_SUPERVISOR", this.notifySupervisorHandler);

    this.handlers.set("CREATE_INCIDENT", this.createIncidentHandler);
  }

  getHandler(actionType: string) {
    return this.handlers.get(actionType);
  }
}
