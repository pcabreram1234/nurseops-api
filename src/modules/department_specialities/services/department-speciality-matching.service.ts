import { Injectable } from "@nestjs/common";

@Injectable()
export class DepartmentSpecialityMatchingService {
  match(nurseSpecialities: string[], requiredSpecialities: string[]) {
    return requiredSpecialities.every((speciality) =>
      nurseSpecialities.includes(speciality),
    );
  }
}
