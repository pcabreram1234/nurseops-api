export interface DistributionRulePayload {
  nurseId?: string;

  departmentId?: string;

  organizationId?: string;

  month?: number;

  year?: number;

  totalNightShifts?: number;

  totalWeekendShifts?: number;

  overtimeHours?: number;

  [key: string]: any;
}
