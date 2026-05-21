import { Injectable } from "@nestjs/common";

@Injectable()
export class ShiftTemplateOverlapValidator {
  validate() {
    return true;
  }
}
