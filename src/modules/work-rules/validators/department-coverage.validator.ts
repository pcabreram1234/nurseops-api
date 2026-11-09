import { Injectable } from "@nestjs/common";

import { WorkRuleValidator } from "../interfaces/work-rule-validator.interface";

import { WorkRuleResult } from "../interfaces/work-rule-result.interface";

@Injectable()
export class DepartmentCoverageValidator implements WorkRuleValidator {
  code = "RULE_DEPT_COVERAGE";

  async validate(rule: any, payload: any): Promise<WorkRuleResult> {
    const departmentId = payload.departmentId;
    const currentAssigned = payload.currentAssigned || 0;
    const requiredStaff = payload.requiredStaff || 0;
    const isAssignmentChange = payload.isAssignmentChange !== false;

    if (!departmentId || !isAssignmentChange) {
      return { valid: true };
    }

    if (currentAssigned < requiredStaff) {
      return {
        valid: false,
        code: this.code,
        severity: "HIGH",
        message: `Cobertura insuficiente en el departamento. Asignados: ${currentAssigned}, Requeridos: ${requiredStaff}.`,
        metadata: {
          departmentId,
          currentAssigned,
          requiredStaff,
          shortage: requiredStaff - currentAssigned,
        },
      };
    }

    return { valid: true };
  }
}
