import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { WorkRulesService } from "../services/work-rules.service";

import { CreateWorkRuleDto } from "../dto/create-work-rule.dto";

import { UpdateWorkRuleDto } from "../dto/update-work-rule.dto";

import { WorkRuleFilterDto } from "../dto/work-rule-filter.dto";

import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller({
  path: "work-rules",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles("ADMIN", "SUPER")
export class WorkRulesController {
  constructor(private readonly workRulesService: WorkRulesService) { }

  @Post()
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.WORK_RULES.CREATE)
  create(@Body() dto: CreateWorkRuleDto) {
    return this.workRulesService.create(dto);
  }

  @Get()
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.WORK_RULES.READ)
  findAll(@Query() query: WorkRuleFilterDto, @CurrentUser() user: any) {
    return this.workRulesService.findAll(query, user);
  }

  @Get(":id")
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.WORK_RULES.READ)
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.workRulesService.findOne(id, user);
  }

  @Patch(":id")
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.WORK_RULES.UPDATE)
  update(@Param("id") id: string, @Body() dto: UpdateWorkRuleDto, @CurrentUser() user: any) {
    return this.workRulesService.update(id, dto, user);
  }

  @Delete(":id")
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.WORK_RULES.DELETE)
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.workRulesService.remove(id, user);
  }
}
