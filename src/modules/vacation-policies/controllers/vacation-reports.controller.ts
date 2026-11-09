import { Controller, Get, Query, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { Permissions } from "@modules/auth/decorators/permissions.decorator";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { VacationReportsService } from "../services/vacation-reports.service";

@Controller({
  path: "vacation-reports",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VacationReportsController {
  constructor(private readonly service: VacationReportsService) {}

  @Get("policies")
  @Roles("SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR")
  @Permissions("VIEW_VACATION_POLICIES")
  getPoliciesReport(@CurrentUser() user: any) {
    return this.service.getPoliciesReport(user);
  }

  @Get("profiles")
  @Roles("SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR")
  @Permissions("VIEW_VACATION_POLICIES")
  getProfilesReport(
    @CurrentUser() user: any,
    @Query("nurseId") nurseId?: string,
    @Query("policyId") policyId?: string,
  ) {
    return this.service.getProfilesReport(user, { nurseId, policyId });
  }

  @Get("balances")
  @Roles("SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR")
  @Permissions("VIEW_VACATION_POLICIES")
  getBalancesReport(@CurrentUser() user: any) {
    return this.service.getBalancesReport(user);
  }
}
