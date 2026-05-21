import { Injectable } from "@nestjs/common";

@Injectable()
export class SpecialityCompatibilityValidator {
  validate(nurse: any, speciality: any) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE COMPATIBILITY ENGINE
    |--------------------------------------------------------------------------
    */

    return {
      valid: true,
    };
  }
}
