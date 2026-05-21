import { Injectable } from "@nestjs/common";

@Injectable()
export class ConditionEvaluatorService {
  evaluate(left: any, operator: string, right: any) {
    switch (operator) {
      case "GREATER_THAN":
        return left > right;

      case "LESS_THAN":
        return left < right;

      case "EQUALS":
        return left === right;

      default:
        return false;
    }
  }
}
