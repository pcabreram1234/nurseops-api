import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class NightLimitValidator {
  validate(currentNights: number, maxNights: number) {
    if (currentNights > maxNights) {
      throw new BadRequestException("Night shift limit exceeded");
    }

    return true;
  }
}
