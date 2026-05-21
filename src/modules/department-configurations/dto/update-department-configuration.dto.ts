import { PartialType } from "@nestjs/mapped-types";

import { CreateDepartmentConfigurationDto } from "./create-department-configuration.dto";

export class UpdateDepartmentConfigurationDto extends PartialType(
  CreateDepartmentConfigurationDto,
) {}
