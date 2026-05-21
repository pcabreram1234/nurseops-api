import { Injectable } from "@nestjs/common";

@Injectable()
export class DepartmentPolicyEngineService {
  async evaluate(
    configuration: any,

    payload: any,
  ) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE POLICY ENGINE
    |--------------------------------------------------------------------------
    */

    return {
      valid: true,
    };
  }
}
