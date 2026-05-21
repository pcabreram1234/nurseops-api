import { Injectable } from "@nestjs/common";

@Injectable()
export class ConditionParserService {
  parse(value: string) {
    if (!isNaN(Number(value))) {
      return Number(value);
    }

    return value;
  }
}
