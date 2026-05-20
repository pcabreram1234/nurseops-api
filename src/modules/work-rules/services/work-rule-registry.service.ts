import { Injectable } from "@nestjs/common";

import { WorkRuleValidator } from "../interfaces/work-rule-validator.interface";

@Injectable()
export class WorkRuleRegistryService {
  private validators = new Map<string, WorkRuleValidator>();

  register(validator: WorkRuleValidator) {
    this.validators.set(validator.code, validator);
  }

  getValidator(code: string) {
    return this.validators.get(code);
  }

  getAllValidators() {
    return this.validators;
  }
}
