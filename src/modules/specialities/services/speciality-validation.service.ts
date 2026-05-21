import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class SpecialityValidationService {
  validateRequiredSpeciality(speciality: any) {
    if (!speciality?.isActive) {
      throw new BadRequestException("Inactive speciality");
    }

    return true;
  }
}
