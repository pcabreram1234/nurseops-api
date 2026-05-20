import { PartialType } from "@nestjs/mapped-types";

import { CreateWorkRuleDto } from "./create-work-rule.dto";

export class UpdateWorkRuleDto extends PartialType(CreateWorkRuleDto) {}
