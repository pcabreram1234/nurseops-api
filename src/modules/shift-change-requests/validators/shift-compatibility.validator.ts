import { Injectable } from "@nestjs/common";

@Injectable()
export class ShiftCompatibilityValidator {
  async validate(payload: any) {
    return {
      valid: true,
    };
  }
}
