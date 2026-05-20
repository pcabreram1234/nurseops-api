import { Injectable } from "@nestjs/common";

import { DistributionValidator } from "../interfaces/distribution-validator.interface";

@Injectable()
export class DistributionRegistryService {
  private validators = new Map<string, DistributionValidator>();

  /*
  |--------------------------------------------------------------------------
  | REGISTER
  |--------------------------------------------------------------------------
  */

  register(validator: DistributionValidator) {
    this.validators.set(validator.code, validator);
  }

  /*
  |--------------------------------------------------------------------------
  | GET VALIDATOR
  |--------------------------------------------------------------------------
  */

  getValidator(code: string) {
    return this.validators.get(code);
  }

  /*
  |--------------------------------------------------------------------------
  | ALL
  |--------------------------------------------------------------------------
  */

  getAll() {
    return this.validators;
  }
}
