import { Injectable } from "@nestjs/common";

@Injectable()
export class EmergencyLicenseValidator {
  async validate(nurse: any) {
    /*
    |--------------------------------------------------------------------------
    | LICENSE VALIDATION
    |--------------------------------------------------------------------------
    */

    return {
      valid: true,
    };
  }
}
