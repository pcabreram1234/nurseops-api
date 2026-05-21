import { OnEvent } from "@nestjs/event-emitter";

export class ShiftChangeApprovedListener {
  @OnEvent("shift-change.approved")
  handle(payload: any) {
    console.log("Shift approved", payload);
  }
}
