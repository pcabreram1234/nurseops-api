import { Injectable } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class WorkRuleActionListener {
  @OnEvent("work-rule-action.executed")
  async handleExecuted(payload: any) {
    console.log("Action executed", payload);
  }

  @OnEvent("work-rule-action.failed")
  async handleFailed(payload: any) {
    console.log("Action failed", payload);
  }
}
