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

import { WorkRuleConditionsService } from "../services/work-rule-conditions.service";

import { CreateWorkRuleConditionDto } from "../dto/create-work-rule-condition.dto";
import { UpdateWorkRuleConditionDto } from "../dto/update-work-rule-condition.dto";

@Controller({
  path: "work-rule-conditions",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPER")
export class WorkRuleConditionsController {
  constructor(private readonly service: WorkRuleConditionsService) { }

  @Post()
  create(@Body() dto: CreateWorkRuleConditionDto) {
    return this.service.create(dto);
  }

  @Get(":workRuleId")
  findAll(@Param("workRuleId") workRuleId: string) {
    return this.service.findAll(workRuleId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateWorkRuleConditionDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
