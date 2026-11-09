import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { WorkRuleConditionsService } from "../services/work-rule-conditions.service";

import { CreateWorkRuleConditionDto } from "../dto/create-work-rule-condition.dto";
import { UpdateWorkRuleConditionDto } from "../dto/update-work-rule-condition.dto";

import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller({
  path: "work-rule-conditions",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles("ADMIN", "SUPER")
export class WorkRuleConditionsController {
  constructor(private readonly service: WorkRuleConditionsService) { }

  @Post()
  @Permissions(PERMISSIONS.WORK_RULE_CONDITIONS.CREATE)
  create(@Body() dto: CreateWorkRuleConditionDto) {
    return this.service.create(dto);
  }

  @Get(":workRuleId")
  @Permissions(PERMISSIONS.WORK_RULE_CONDITIONS.READ)
  findAll(@Param("workRuleId") workRuleId: string) {
    return this.service.findAll(workRuleId);
  }

  @Patch(":id")
  @Permissions(PERMISSIONS.WORK_RULE_CONDITIONS.UPDATE)
  update(@Param("id") id: string, @Body() dto: UpdateWorkRuleConditionDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @Permissions(PERMISSIONS.WORK_RULE_CONDITIONS.DELETE)
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
