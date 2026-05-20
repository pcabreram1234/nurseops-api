import { Injectable } from "@nestjs/common";

@Injectable()
export class EmergencyAlertService {
  async sendCoverageAlert(payload: any) {
    /*
    |--------------------------------------------------------------------------
    | SEND ALERTS
    |--------------------------------------------------------------------------
    */

    console.log("Emergency alert", payload);
  }
}
