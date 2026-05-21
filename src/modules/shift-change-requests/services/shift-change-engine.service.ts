import { Injectable } from "@nestjs/common";

@Injectable()
export class ShiftChangeEngineService {
  async evaluate(request: any) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE AI / RULE ENGINE
    |--------------------------------------------------------------------------
    */

    return {
      approved: true,

      riskScore: 20,
    };
  }
}
