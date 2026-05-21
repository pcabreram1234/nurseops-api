import { Injectable } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class ScheduleVersionListener {
  @OnEvent("schedule-version.created")
  async handleCreated(payload: any) {
    console.log("Schedule version created", payload);
  }
}
