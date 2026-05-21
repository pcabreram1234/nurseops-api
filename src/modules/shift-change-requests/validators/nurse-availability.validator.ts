import { Injectable } from "@nestjs/common";

@Injectable()
export class NurseAvailabilityValidator {
  async validate(payload: any) {
    return {
      valid: true,
    };
  }
}
