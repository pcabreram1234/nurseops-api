import { PartialType } from "@nestjs/mapped-types";

import { CreateOrganizationSettingDto } from "./create-organization-setting.dto";

export class UpdateOrganizationSettingDto extends PartialType(
  CreateOrganizationSettingDto,
) {}
