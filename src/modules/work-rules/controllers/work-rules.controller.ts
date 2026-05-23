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

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { WorkRulesService } from "../services/work-rules.service";

import { CreateWorkRuleDto } from "../dto/create-work-rule.dto";

import { UpdateWorkRuleDto } from "../dto/update-work-rule.dto";

@Controller({
  path: "work-rules",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPER")
export class WorkRulesController {
  constructor(private readonly workRulesService: WorkRulesService) { }

  @Post()
  create(@Body() dto: CreateWorkRuleDto) {
    return this.workRulesService.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: any,) {
    return this.workRulesService.findAll(user.organizationId, user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.workRulesService.findOne(id, user);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateWorkRuleDto, @CurrentUser() user: any) {
    return this.workRulesService.update(id, dto, user);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.workRulesService.remove(id, user);
  }
}
