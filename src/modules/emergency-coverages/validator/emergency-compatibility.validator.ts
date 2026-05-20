import { Injectable } from "@nestjs/common";

@Injectable()
export class EmergencyCompatibilityValidator {
  async validate(
    nurse: any,

    department: any,
  ) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE COMPATIBILITY ENGINE
    |--------------------------------------------------------------------------
    */

    return {
      valid: true,

      compatibilityScore: 0.9,
    };
  }
}
