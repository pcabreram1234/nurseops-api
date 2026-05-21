import { Injectable } from "@nestjs/common";

@Injectable()
export class CreateIncidentHandler {
  async execute(action: any, payload: any) {
    return {
      incidentCreated: true,
    };
  }
}
