import { Injectable, Logger } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class DistributionRuleListener {
  private readonly logger = new Logger(DistributionRuleListener.name);

  @OnEvent("distribution-rule.triggered")
  async handleTriggered(payload: any) {
    this.logger.warn(`Distribution rule triggered: ${payload.ruleType}`);
  }
}
