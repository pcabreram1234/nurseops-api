import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import {
  CreateVacationPolicyDto,
  CreateVacationPolicyRuleDto,
  AssignVacationPolicyDto,
  SimulateVacationDto,
} from "../dto";

import { VacationPolicy } from "../types";

import { VacationPolicyService } from "../services/vacation-policy.service";

@Controller({
  path: "vacation-policies",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VacationPolicyController {
  constructor(private readonly service: VacationPolicyService) {}

  @Get()
  @Permissions("VIEW_VACATION_POLICIES")
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user);
  }

  @Get(":id")
  @Permissions("VIEW_VACATION_POLICY")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @Permissions("MANAGE_VACATION_POLICIES")
  create(@Body() dto: CreateVacationPolicyDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Patch(":id")
  @Permissions("MANAGE_VACATION_POLICIES")
  update(@Param("id") id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Patch(":id/activate")
  @Permissions("ACTIVATE_VACATION_POLICY")
  activate(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.activate(id, user);
  }

  @Post(":id/assign")
  @Permissions("ASSIGN_VACATION_POLICY")
  assignToNurse(@Param("id") id: string, @Body() dto: AssignVacationPolicyDto, @CurrentUser() user: any) {
    return this.service.assignToNurse({ ...dto, policyId: id }, user);
  }

  @Post(":id/simulate")
  @Permissions("SIMULATE_VACATION_POLICY")
  simulate(@Param("id") id: string, @Body() dto: SimulateVacationDto, @CurrentUser() user: any) {
    return this.service.simulate(dto, user);
  }
}