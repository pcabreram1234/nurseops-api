import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class ConditionOperatorValidator {
  validate(operator: string) {
    const validOperators = ["EQUALS", "GREATER_THAN", "LESS_THAN"];

    if (!validOperators.includes(operator)) {
      throw new BadRequestException("Invalid operator");
    }

    return true;
  }
}
