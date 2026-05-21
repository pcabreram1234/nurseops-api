import { Injectable } from "@nestjs/common";

@Injectable()
export class ShiftChangeNotificationService {
  async notify(payload: any) {
    return {
      notified: true,
    };
  }
}
