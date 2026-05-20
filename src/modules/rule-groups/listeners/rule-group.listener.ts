import { Injectable, Logger } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class RuleGroupListener {
  private readonly logger = new Logger(RuleGroupListener.name);

  @OnEvent("rule-group.triggered")
  async handleTriggered(payload: any) {
    this.logger.warn(
      `
      Rule Group Triggered:
      ${payload.ruleGroupId}
      `,
    );
  }
}
