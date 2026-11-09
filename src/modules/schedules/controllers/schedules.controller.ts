import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from "@nestjs/common";

import { SchedulesService, UserOrgContext } from "../services/schedules.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateScheduleDto } from "../dto/create-schedule.dto";

import { UpdateScheduleDto } from "../dto/update-schedule.dto";

import { ScheduleFilterDto } from "../dto/schedule-filter.dto";

import { PaginationDto } from "../dto/pagination.dto";

import { GenerateScheduleDto } from "../dto/generate-schedule.dto";

@Controller({
  path: "schedules",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) { }

  @Post()
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "DEPARTMENT_HEAD", "NIGHT_SUPERVISOR", "SUPERVISOR")
  @Permissions("CREATE_SCHEDULE")
  create(@Body() dto: CreateScheduleDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      departmentId: user?.departmentId,
      role: user?.role,
      id: user?.id || user?.sub,
    };
    return this.schedulesService.create(dto, userOrg);
  }

  @Get()
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGHT_SUPERVISOR", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE")
  @Permissions("VIEW_SCHEDULES")
  findAll(@Query() query: ScheduleFilterDto & PaginationDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      departmentId: user?.departmentId,
      role: user?.role,
    };
    return this.schedulesService.findAll(query, userOrg);
  }

  @Get(":id")
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGHT_SUPERVISOR", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE")
  @Permissions("VIEW_SCHEDULE")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      departmentId: user?.departmentId,
      role: user?.role,
    };
    return this.schedulesService.findOne(id, userOrg);
  }

  @Patch(":id")
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGHT_SUPERVISOR", "SUPERVISOR",)
  @Permissions("UPDATE_SCHEDULE")
  update(@Param("id") id: string, @Body() dto: UpdateScheduleDto, @CurrentUser() user: any,) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      departmentId: user?.departmentId,
      role: user?.role,
    };
    return this.schedulesService.update(id, dto, userOrg);
  }

  @Delete(":id")
  @Roles("SUPER", "SYSTEM_ADMIN")
  @Permissions("DELETE_SCHEDULE")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      departmentId: user?.departmentId,
      role: user?.role,
    };
    return this.schedulesService.remove(id, userOrg);
  }

  @Post("generate")
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGHT_SUPERVISOR", "SUPERVISOR",)
  @Permissions("CREATE_SCHEDULE")
  generateAutomated(
    @Body() dto: GenerateScheduleDto,
    @CurrentUser() user: any
  ) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      departmentId: user?.departmentId,
      role: user?.role,
      id: user?.id || user?.sub,
    };
    return this.schedulesService.generateAutomated(dto, userOrg);
  }
}
