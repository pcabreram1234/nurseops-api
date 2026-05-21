import { Injectable } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class WorkRuleConditionListener {
  /*
  |--------------------------------------------------------------------------
  | CONDITION TRIGGERED
  |--------------------------------------------------------------------------
  */

  @OnEvent("work-rule-condition.triggered")
  async handleTriggered(payload: any) {
    console.log("Condition triggered", payload);

    /*
    |--------------------------------------------------------------------------
    | FUTURE:
    |--------------------------------------------------------------------------
    |
    | - Notifications
    | - Escalations
    | - Auto corrections
    | - AI recommendations
    | - Incident creation
    | - Audit logging
    |
    */
  }

  /*
  |--------------------------------------------------------------------------
  | CONDITION FAILED
  |--------------------------------------------------------------------------
  */

  @OnEvent("work-rule-condition.failed")
  async handleFailed(payload: any) {
    console.log("Condition failed", payload);
  }
}
