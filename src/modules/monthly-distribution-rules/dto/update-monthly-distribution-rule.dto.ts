import { PartialType } from "@nestjs/mapped-types";

import { CreateMonthlyDistributionRuleDto } from "./create-monthly-distribution-rule.dto";

export class UpdateMonthlyDistributionRuleDto extends PartialType(
  CreateMonthlyDistributionRuleDto,
) {}
