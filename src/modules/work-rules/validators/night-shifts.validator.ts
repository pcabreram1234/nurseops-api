import { Injectable } from "@nestjs/common";

import { WorkRuleValidator } from "../interfaces/work-rule-validator.interface";
import { WorkRuleResult } from "../interfaces/work-rule-result.interface";

@Injectable()
export class NightShiftsValidator implements WorkRuleValidator {
  code = "RULE_MAX_NIGHTS";
  async validate(rule: any, payload: any): Promise<WorkRuleResult> {
    const maxNights = Number(rule.value);
    const currentNightShifts = payload.currentNightShifts || 0;

    if (currentNightShifts >= maxNights) {
      return {
        valid: false,
        code: this.code,
        severity: "HIGH",
        message: "Maximum night shifts reached",
        metadata: {
          currentNightShifts,
          maxNights,
        },
      };
    }

    return {
      valid: true,
    };
  }
}
