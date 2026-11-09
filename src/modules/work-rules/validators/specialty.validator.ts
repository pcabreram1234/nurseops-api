import { Injectable } from "@nestjs/common";

import { WorkRuleValidator } from "../interfaces/work-rule-validator.interface";

import { WorkRuleResult } from "../interfaces/work-rule-result.interface";

@Injectable()
export class SpecialtyValidator implements WorkRuleValidator {
  code = "RULE_REQUIRED_SPECIALTY";

  async validate(rule: any, payload: any): Promise<WorkRuleResult> {
    const requiredSpecialtyId = rule.value;
    const nurseSpecialtyId = payload.nurseSpecialtyId;

    if (!requiredSpecialtyId) {
      return { valid: true };
    }

    if (!nurseSpecialtyId || nurseSpecialtyId !== requiredSpecialtyId) {
      return {
        valid: false,
        code: this.code,
        severity: "HIGH",
        message: "La enfermera no posee la especialidad requerida para este turno.",
        metadata: {
          requiredSpecialtyId,
          nurseSpecialtyId,
        },
      };
    }

    return { valid: true };
  }
}
