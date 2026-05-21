import { Injectable } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class SpecialityListener {
  @OnEvent("speciality.created")
  async handleCreated(payload: any) {
    console.log("Speciality created", payload);
  }
}
