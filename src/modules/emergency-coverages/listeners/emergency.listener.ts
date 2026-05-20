import { Injectable } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class EmergencyListener {
  @OnEvent("emergency.created")
  async handleCreated(payload: any) {
    console.log("Emergency created", payload);
  }

  @OnEvent("emergency.assigned")
  async handleAssigned(payload: any) {
    console.log("Emergency assigned", payload);
  }
}
