import { Injectable } from "@nestjs/common";

@Injectable()
export class EmergencyOvertimeValidator {
  async validate(nurse: any) {
    return {
      valid: true,

      overtimeRisk: 0.1,
    };
  }
}
