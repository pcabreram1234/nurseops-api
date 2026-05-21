import { Injectable } from "@nestjs/common";

@Injectable()
export class ShiftChangeRiskService {
  async calculateRisk(payload: any) {
    return {
      riskScore: 25,
    };
  }
}
