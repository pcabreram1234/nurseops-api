import { PartialType } from "@nestjs/mapped-types";

import { CreateWorkRuleActionDto } from "./create-work-rule-action.dto";

export class UpdateWorkRuleActionDto extends PartialType(
  CreateWorkRuleActionDto,
) {}
