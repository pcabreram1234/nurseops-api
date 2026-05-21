import { Injectable } from "@nestjs/common";

@Injectable()
export class NotifySupervisorHandler {
  async execute(action: any, payload: any) {
    return {
      supervisorNotified: true,
    };
  }
}
