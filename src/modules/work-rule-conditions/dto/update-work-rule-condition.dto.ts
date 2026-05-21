import { PartialType } from "@nestjs/mapped-types";

import { CreateWorkRuleConditionDto } from "./create-work-rule-condition.dto";

export class UpdateWorkRuleConditionDto extends PartialType(
  CreateWorkRuleConditionDto,
) {}
