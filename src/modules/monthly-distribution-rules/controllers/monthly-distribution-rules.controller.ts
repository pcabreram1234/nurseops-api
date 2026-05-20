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

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { MonthlyDistributionRulesService } from "../services/monthly-distribution-rules.service";

import { CreateMonthlyDistributionRuleDto } from "../dto/create-monthly-distribution-rule.dto";
import { UpdateMonthlyDistributionRuleDto } from "../dto/update-monthly-distribution-rule.dto";

@Controller({
  path: "monthly-distribution-rules",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPER")
export class MonthlyDistributionRulesController {
  constructor(private readonly service: MonthlyDistributionRulesService) {}

  @Post()
  create(@Body() dto: CreateMonthlyDistributionRuleDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.organizationId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateMonthlyDistributionRuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
