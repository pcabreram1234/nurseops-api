import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { ScheduleVersionsService, UserOrgContext } from "../services/schedule-versions.service";

import { CreateScheduleVersionDto } from "../dto/create-schedule-version.dto";

import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller({
  path: "schedule-versions",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles("SUPER", "SYSTEM_ADMIN", "DEPARTMENT_HEAD")
export class ScheduleVersionsController {
  constructor(private readonly service: ScheduleVersionsService) { }

  @Post()
  @Permissions(PERMISSIONS.SCHEDULE_VERSIONS.CREATE)
  create(@Body() dto: CreateScheduleVersionDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
      id: user?.id || user?.sub,
    };
    return this.service.create(dto, userOrg);
  }

  @Get(":scheduleId")
  @Permissions(PERMISSIONS.SCHEDULE_VERSIONS.READ)
  findAll(@Param("scheduleId") scheduleId: string, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.service.findAll(scheduleId, userOrg);
  }

  @Get("version/:id")
  @Permissions(PERMISSIONS.SCHEDULE_VERSIONS.READ)
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.service.findOne(id, userOrg);
  }
}
