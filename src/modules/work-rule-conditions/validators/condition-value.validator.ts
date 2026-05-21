import { Injectable } from "@nestjs/common";

@Injectable()
export class ConditionValueValidator {
  validate(value: any) {
    return !!value;
  }
}
