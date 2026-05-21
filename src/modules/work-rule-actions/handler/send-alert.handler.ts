import { Injectable } from "@nestjs/common";

@Injectable()
export class SendAlertHandler {
  async execute(action: any, payload: any) {
    return {
      alertSent: true,
    };
  }
}
