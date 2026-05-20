import { Injectable } from "@nestjs/common";

import { DistributionValidator } from "../interfaces/distribution-validator.interface";

@Injectable()
export class OvertimeDistributionValidator implements DistributionValidator {
  code = "LIMIT_OVERTIME";

  async validate(rule: any, payload: any) {
    const maxOvertime = rule.configuration?.maxOvertime || 20;

    const nurses = payload.nurses || [];

    const exceeded = nurses.filter(
      (nurse: any) => nurse.overtimeHours > maxOvertime,
    );

    if (exceeded.length > 0) {
      return {
        valid: false,

        severity: "HIGH",

        message: "Overtime limit exceeded",

        metadata: {
          exceeded,
        },
      };
    }

    return {
      valid: true,
    };
  }
}
