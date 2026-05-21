import { OnEvent } from "@nestjs/event-emitter";

export class ShiftChangeRejectedListener {
  @OnEvent("shift-change.rejected")
  handle(payload: any) {
    console.log("Shift rejected", payload);
  }
}
