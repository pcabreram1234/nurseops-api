import { Injectable } from "@nestjs/common";

import { WorkRuleValidator } from "../interfaces/work-rule-validator.interface";
import { WorkRuleResult } from "../interfaces/work-rule-result.interface";

@Injectable()
export class MaxHoursValidator implements WorkRuleValidator {
  code = "RULE_MAX_HOURS";
  async validate(rule: any, payload: any): Promise<WorkRuleResult> {
    const maxHours = Number(rule.value);
    const currentHours = payload.currentHours || 0;

    if (currentHours > maxHours) {
      return {
        valid: false,
        message: "Maximum hours exceeded",
        severity: "MEDIUM",
        metadata: {
          maxHours,
          currentHours,
        },
      };
    }

    return {
      valid: true,
    };
  }
}
