import { Injectable } from "@nestjs/common";

import { WorkRuleValidator } from "../interfaces/work-rule-validator.interface";

import { WorkRuleResult } from "../interfaces/work-rule-result.interface";

@Injectable()
export class AvailabilityValidator implements WorkRuleValidator {
  code = "RULE_NURSE_AVAILABILITY";

  async validate(rule: any, payload: any): Promise<WorkRuleResult> {
    const isAvailable = payload.isAvailable !== false;
    const availabilityStatus = payload.availabilityStatus;
    const hasVacation = payload.hasVacation || false;
    const hasLeave = payload.hasLeave || false;

    if (!isAvailable) {
      return {
        valid: false,
        code: this.code,
        severity: "HIGH",
        message: "La enfermera no está disponible para trabajar en este horario.",
        metadata: {
          availabilityStatus,
          hasVacation,
          hasLeave,
        },
      };
    }

    if (hasVacation) {
      return {
        valid: false,
        code: this.code,
        severity: "HIGH",
        message: "La enfermera tiene vacaciones aprobadas para esta fecha.",
        metadata: {
          hasVacation: true,
        },
      };
    }

    if (hasLeave) {
      return {
        valid: false,
        code: this.code,
        severity: "HIGH",
        message: "La enfermera tiene una licencia o permiso aprobado para esta fecha.",
        metadata: {
          hasLeave: true,
        },
      };
    }

    return { valid: true };
  }
}
