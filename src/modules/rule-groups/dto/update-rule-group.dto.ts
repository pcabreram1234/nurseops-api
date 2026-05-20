import { PartialType } from "@nestjs/mapped-types";

import { CreateRuleGroupDto } from "./create-rule-group.dto";

export class UpdateRuleGroupDto extends PartialType(CreateRuleGroupDto) {}
