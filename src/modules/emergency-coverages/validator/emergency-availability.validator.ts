import { Injectable } from "@nestjs/common";

@Injectable()
export class EmergencyAvailabilityValidator {
  async validate(nurse: any) {
    /*
    |--------------------------------------------------------------------------
    | CHECK AVAILABILITY
    |--------------------------------------------------------------------------
    */

    return {
      valid: true,
    };
  }
}
