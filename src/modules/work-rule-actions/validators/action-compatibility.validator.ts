import { Injectable } from "@nestjs/common";

@Injectable()
export class ActionCompatibilityValidator {
  validate(action: any) {
    return true;
  }
}
