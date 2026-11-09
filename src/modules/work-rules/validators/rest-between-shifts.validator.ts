import { Injectable } from "@nestjs/common";

import { WorkRuleValidator } from "../interfaces/work-rule-validator.interface";

import { WorkRuleResult } from "../interfaces/work-rule-result.interface";

@Injectable()
export class RestBetweenShiftsValidator implements WorkRuleValidator {
  code = "RULE_MIN_REST_HOURS";

  async validate(rule: any, payload: any): Promise<WorkRuleResult> {
    const minRestHours = Number(rule.value);
    const lastShiftEndTime = payload.lastShiftEndTime;
    const candidateStartTime = payload.candidateStartTime;

    if (!lastShiftEndTime || !candidateStartTime) {
      return { valid: true };
    }

    const restMs = new Date(candidateStartTime).getTime() - new Date(lastShiftEndTime).getTime();
    const restHours = restMs / (1000 * 60 * 60);

    if (restHours < minRestHours) {
      return {
        valid: false,
        code: this.code,
        severity: "HIGH",
        message: `Descanso insuficiente entre turnos. Mínimo requerido: ${minRestHours} horas. Restante: ${restHours.toFixed(1)} horas.`,
        metadata: {
          minRestHours,
          restHours,
        },
      };
    }

    return { valid: true };
  }
}
