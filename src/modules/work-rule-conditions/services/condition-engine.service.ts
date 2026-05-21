import { Injectable } from "@nestjs/common";

@Injectable()
export class ConditionEngineService {
  evaluate(
    condition: any,

    payload: any,
  ) {
    const actualValue = payload[condition.condition_type];

    switch (condition.operator) {
      case "GREATER_THAN":
        return actualValue > Number(condition.value);

      case "LESS_THAN":
        return actualValue < Number(condition.value);

      case "EQUALS":
        return actualValue == condition.value;

      default:
        return false;
    }
  }
}
