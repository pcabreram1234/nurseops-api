import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class MinimumStaffValidator {
  validate(currentStaff: number, minimum: number) {
    if (currentStaff < minimum) {
      throw new BadRequestException("Minimum staff not satisfied");
    }

    return true;
  }
}
