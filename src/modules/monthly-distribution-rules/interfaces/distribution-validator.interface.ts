import { DistributionRuleResult } from "./distribution-result.interface";

export interface DistributionValidator {
  code: string;

  validate(rule: any, payload: any): Promise<DistributionRuleResult>;
}
