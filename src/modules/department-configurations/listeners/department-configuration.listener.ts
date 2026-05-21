import { Injectable } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class DepartmentConfigurationListener {
  @OnEvent("department-configuration.updated")
  async handleUpdated(payload: any) {
    console.log("Department configuration updated", payload);
  }
}
