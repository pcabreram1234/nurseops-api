import { Injectable } from "@nestjs/common";

@Injectable()
export class ScheduleVersionValidator {
  validate(version: any) {
    return {
      valid: true,
    };
  }
}
