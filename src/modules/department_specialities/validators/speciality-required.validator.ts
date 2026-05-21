import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class SpecialityRequiredValidator {
  validate(hasSpeciality: boolean) {
    if (!hasSpeciality) {
      throw new BadRequestException("Required speciality missing");
    }

    return true;
  }
}
