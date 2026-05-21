import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class SpecialityCoverageValidator {
  validate(coverageValid: boolean) {
    if (!coverageValid) {
      throw new BadRequestException("Speciality coverage insufficient");
    }

    return true;
  }
}
