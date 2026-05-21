import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class SpecialityActiveValidator {
  validate(speciality: any) {
    if (!speciality.isActive) {
      throw new BadRequestException("Speciality inactive");
    }

    return true;
  }
}
