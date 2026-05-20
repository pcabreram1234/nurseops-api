import { Injectable } from "@nestjs/common";

@Injectable()
export class EmergencyAIService {
  async generateRecommendation(payload: any) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE AI ENGINE
    |--------------------------------------------------------------------------
    */

    return {
      recommended: true,
    };
  }
}
