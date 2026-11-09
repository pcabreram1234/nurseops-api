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

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { MonthlyDistributionRulesService } from "../services/monthly-distribution-rules.service";

import { CreateMonthlyDistributionRuleDto } from "../dto/create-monthly-distribution-rule.dto";
import { UpdateMonthlyDistributionRuleDto } from "../dto/update-monthly-distribution-rule.dto";

import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller({
  path: "monthly-distribution-rules",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles("SUPER", "SYSTEM_ADMIN")
export class MonthlyDistributionRulesController {
  constructor(private readonly service: MonthlyDistributionRulesService) { }

  @Post()
  @Permissions(PERMISSIONS.MONTHLY_DISTRIBUTION_RULES.CREATE)
  create(@Body() dto: CreateMonthlyDistributionRuleDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions(PERMISSIONS.MONTHLY_DISTRIBUTION_RULES.READ)
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.organizationId);
  }

  @Get(":id")
  @Permissions(PERMISSIONS.MONTHLY_DISTRIBUTION_RULES.READ)
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Patch(":id")
  @Permissions(PERMISSIONS.MONTHLY_DISTRIBUTION_RULES.UPDATE)
  update(@Param("id") id: string, @Body() dto: UpdateMonthlyDistributionRuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @Permissions(PERMISSIONS.MONTHLY_DISTRIBUTION_RULES.DELETE)
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
