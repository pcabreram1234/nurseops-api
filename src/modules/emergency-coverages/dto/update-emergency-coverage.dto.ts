import { PartialType } from "@nestjs/mapped-types";

import { CreateEmergencyCoverageDto } from "./create-emergency-coverage.dto";

export class UpdateEmergencyCoverageDto extends PartialType(
  CreateEmergencyCoverageDto,
) {}
