import { PartialType } from "@nestjs/mapped-types";

import { CreateShiftChangeRequestDto } from "./create-shift-change-request.dto";

export class UpdateShiftChangeRequestDto extends PartialType(
  CreateShiftChangeRequestDto,
) {}
