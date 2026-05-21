export interface ConditionResultInterface {
  valid: boolean;

  conditionId?: string;

  conditionType?: string;

  operator?: string;

  expectedValue?: any;

  actualValue?: any;

  message?: string;

  severity?: string;
}
