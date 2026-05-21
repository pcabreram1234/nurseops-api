import { Injectable } from "@nestjs/common";

@Injectable()
export class RestrictionValidator {
  async validate(payload: any) {
    return {
      valid: true,
    };
  }
}
