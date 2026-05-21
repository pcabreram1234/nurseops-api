import { Injectable } from "@nestjs/common";

@Injectable()
export class FatigueRiskValidator {
  async validate(payload: any) {
    return {
      valid: true,
      riskScore: 15,
    };
  }
}
