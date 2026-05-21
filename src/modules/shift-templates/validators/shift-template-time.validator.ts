import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class ShiftTemplateTimeValidator {
  validate(startTime: string, endTime: string) {
    if (startTime >= endTime) {
      throw new BadRequestException("Invalid shift template time");
    }

    return true;
  }
}
