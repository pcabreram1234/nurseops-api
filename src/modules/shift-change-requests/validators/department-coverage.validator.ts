import { Injectable } from "@nestjs/common";

@Injectable()
export class DepartmentCoverageValidator {
  async validate(payload: any) {
    return {
      valid: true,
    };
  }
}
