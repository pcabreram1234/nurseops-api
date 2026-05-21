import { Injectable } from "@nestjs/common";

@Injectable()
export class SpecialityCertificationValidator {
  validate(nurse: any) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE CERTIFICATION VALIDATION
    |--------------------------------------------------------------------------
    */

    return {
      valid: true,
    };
  }
}
