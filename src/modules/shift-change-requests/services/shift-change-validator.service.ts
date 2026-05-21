import { Injectable, BadRequestException } from "@nestjs/common";

import { ShiftCompatibilityValidator } from "@modules/shift-change-requests/validators/shift-compatibility.validator";

import { OvertimeValidator } from "@modules/shift-change-requests/validators/overtime.validator";

import { NurseAvailabilityValidator } from "@modules/shift-change-requests/validators/nurse-availability.validator";

type ValidationResult = { valid: boolean; message?: string };

@Injectable()
export class ShiftChangeValidatorService {
  constructor(
    private readonly shiftCompatibilityValidator: ShiftCompatibilityValidator,

    private readonly overtimeValidator: OvertimeValidator,

    private readonly nurseAvailabilityValidator: NurseAvailabilityValidator,
  ) {}

  async validate(payload: any) {
    const validators = [
      this.shiftCompatibilityValidator,
      this.overtimeValidator,
      this.nurseAvailabilityValidator,
    ];

    for (const validator of validators) {
      const result = (await validator.validate(payload)) as ValidationResult;

      if (!result.valid) {
        throw new BadRequestException(result.message ?? "Validation failed");
      }
    }

    return true;
  }
}
