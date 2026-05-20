import { WorkRuleResult } from "./work-rule-result.interface";

export interface WorkRuleValidator {
  code: string;

  validate(rule: any, payload: any): Promise<WorkRuleResult>;
}
