import { PartialType } from "@nestjs/mapped-types";

import { AssignSpecialityToDepartmentDto } from "./assign-speciality-to-department.dto";

export class UpdateDepartmentSpecialityDto extends PartialType(
  AssignSpecialityToDepartmentDto,
) {}
