export interface ApprovalResult {
  valid: boolean;
  code?: string;
  severity?: "HIGH" | "MEDIUM" | "LOW";
  message?: string;
}
