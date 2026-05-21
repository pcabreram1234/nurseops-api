export interface ShiftChangeValidatorInterface {
  validate(payload: any): Promise<{ valid: boolean; message?: string }>;
}
