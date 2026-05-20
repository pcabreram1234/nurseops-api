import { Injectable } from "@nestjs/common";

@Injectable()
export class EmergencyFatigueValidator {
  async validate(nurse: any) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE FATIGUE ENGINE
    |--------------------------------------------------------------------------
    */

    return {
      valid: true,

      fatigueRisk: 0.2,
    };
  }
}
