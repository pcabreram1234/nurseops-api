export interface WorkRulePayload {
  nurseId?: string;

  shiftId?: string;

  scheduleId?: string;

  organizationId?: string;

  currentHours?: number;

  currentNightShifts?: number;

  consecutiveDays?: number;

  [key: string]: any;
}
