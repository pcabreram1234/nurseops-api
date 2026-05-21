import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class DepartmentSpecialityValidationService {
  validate(assignment: any) {
    if (!assignment.required) {
      return true;
    }

    return true;
  }
}
