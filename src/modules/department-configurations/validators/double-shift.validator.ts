import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class DoubleShiftValidator {
  validate(allowDoubleShift: boolean) {
    if (!allowDoubleShift) {
      throw new BadRequestException("Double shifts not allowed");
    }

    return true;
  }
}
