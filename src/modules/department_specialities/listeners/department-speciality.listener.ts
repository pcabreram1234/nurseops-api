import { Injectable } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class DepartmentSpecialityListener {
  @OnEvent("department-speciality.assigned")
  async handleAssigned(payload: any) {
    console.log("Department speciality assigned", payload);
  }
}
