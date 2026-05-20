import { Injectable, Logger } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

import { WorkRuleTriggeredEvent } from "../events/work-rule-triggered.event";

@Injectable()
export class WorkRuleListener {
  private readonly logger = new Logger(WorkRuleListener.name);

  @OnEvent("work-rule.triggered")
  async handleRuleTriggered(event: WorkRuleTriggeredEvent) {
    this.logger.warn(
      `
      Rule triggered:
      ${event.ruleCode}
      Nurse: ${event.nurseId}
      Message: ${event.message}
      `,
    );

    /*
    |--------------------------------------------------------------------------
    | FUTURE:
    |--------------------------------------------------------------------------
    |
    | - notifications
    | - operational alerts
    | - websocket emit
    | - analytics
    | - audit logs
    |
    */
  }
}
