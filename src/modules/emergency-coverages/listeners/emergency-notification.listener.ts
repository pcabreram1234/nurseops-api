import { Injectable } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class EmergencyNotificationListener {
  @OnEvent("emergency.created")
  async notifyCandidates(payload: any) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE PUSH NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    console.log("Notify emergency", payload);
  }
}
