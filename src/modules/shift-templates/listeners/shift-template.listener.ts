import { Injectable } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class ShiftTemplateListener {
  @OnEvent("shift-template.created")
  async handleCreated(payload: any) {
    console.log("Shift template created", payload);
  }
}
