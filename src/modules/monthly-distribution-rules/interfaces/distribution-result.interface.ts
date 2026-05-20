export interface DistributionRuleResult {
  valid: boolean;

  message?: string;

  severity?: string;

  type?: string;

  metadata?: Record<string, any>;
}
