export interface WorkRuleResult {
  valid: boolean;

  code?: string;

  message?: string;

  severity?: "LOW" | "MEDIUM" | "HIGH";

  metadata?: Record<string, any>;
}
