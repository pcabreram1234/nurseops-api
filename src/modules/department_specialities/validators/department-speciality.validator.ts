import { Injectable } from "@nestjs/common";

@Injectable()
export class DepartmentSpecialityValidator {
  validate(assignment: any) {
    return {
      valid: true,
    };
  }
}
