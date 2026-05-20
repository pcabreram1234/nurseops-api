import { Injectable } from "@nestjs/common";

import { DistributionValidator } from "../interfaces/distribution-validator.interface";

@Injectable()
export class BalanceNightsValidator implements DistributionValidator {
  code = "BALANCE_NIGHTS";

  async validate(rule: any, payload: any) {
    const maxDifference = rule.configuration?.maxDifference || 2;

    const nurses = payload.nurses || [];

    /*
    |--------------------------------------------------------------------------
    | CALCULATE
    |--------------------------------------------------------------------------
    */

    const nightCounts = nurses.map((nurse: any) => nurse.nightShifts || 0);
    const max = Math.max(...nightCounts);
    const min = Math.min(...nightCounts);

    /*
    |--------------------------------------------------------------------------
    | VALIDATE
    |--------------------------------------------------------------------------
    */

    if (max - min > maxDifference) {
      return {
        valid: false,
        severity: "HIGH",
        message: "Night shifts are not balanced",
        metadata: {
          max,
          min,
          difference: max - min,
        },
      };
    }

    return {
      valid: true,
    };
  }
}
