import { Injectable } from "@nestjs/common";

@Injectable()
export class EmergencyDepartmentValidator {
  async validate(
    nurse: any,

    department: any,
  ) {
    /*
    |--------------------------------------------------------------------------
    | DEPARTMENT SKILLS VALIDATION
    |--------------------------------------------------------------------------
    */

    return {
      valid: true,
    };
  }
}
