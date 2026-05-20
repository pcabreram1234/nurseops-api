import { Injectable } from "@nestjs/common";

import { WorkRulePayload } from "../interfaces/work-rule.interface";

import { WorkRuleResult } from "../interfaces/work-rule-result.interface";

@Injectable()
export class ConsecutiveDaysValidator {
  code = "RULE_CONSECUTIVES_DAYS";
  async validate(rule: any, payload: WorkRulePayload): Promise<WorkRuleResult> {
    const maxDays = Number(rule.value);

    const consecutiveDays = payload.consecutiveDays || 0;

    if (consecutiveDays >= maxDays) {
      return {
        valid: false,

        code: rule.code,

        severity: "HIGH",

        message: "Maximum consecutive days exceeded",

        metadata: {
          consecutiveDays,

          maxDays,
        },
      };
    }

    return {
      valid: true,
    };
  }
}
