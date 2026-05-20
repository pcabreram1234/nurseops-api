import { Injectable } from "@nestjs/common";

import { DistributionValidator } from "../interfaces/distribution-validator.interface";

@Injectable()
export class BalanceWeekendsValidator implements DistributionValidator {
  code = "BALANCE_WEEKENDS";

  async validate(rule: any, payload: any) {
    const nurses = payload.nurses || [];

    const maxDifference = rule.configuration?.maxDifference || 1;

    const weekendCounts = nurses.map((nurse: any) => nurse.weekendShifts || 0);

    const max = Math.max(...weekendCounts);

    const min = Math.min(...weekendCounts);

    if (max - min > maxDifference) {
      return {
        valid: false,
        severity: "MEDIUM",
        message: "Weekend shifts distribution is unbalanced",
        metadata: {
          max,
          min,
        },
      };
    }

    return {
      valid: true,
    };
  }
}
