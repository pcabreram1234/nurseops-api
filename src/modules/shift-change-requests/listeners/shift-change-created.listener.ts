import { OnEvent } from "@nestjs/event-emitter";

export class ShiftChangeCreatedListener {
  @OnEvent("shift-change.created")
  handle(payload: any) {
    console.log("Shift change created", payload);
  }
}
