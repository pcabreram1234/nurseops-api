import { Injectable } from "@nestjs/common";

@Injectable()
export class ConditionBuilderService {
  build(conditions: any[]) {
    return conditions;
  }
}
