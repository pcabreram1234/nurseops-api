import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Delete
} from "@nestjs/common";

import { ScheduleEntriesService, UserOrgContext } from "../services/schedule-entries.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateScheduleEntryDto } from "../dto/create-schedule-entry.dto";

import { UpdateScheduleEntryDto } from "../dto/update-schedule-entry.dto";

import { ScheduleEntryFilterDto } from "../dto/schedule-entry-filter.dto";
import { CreateBulkScheduleEntryDto } from "../dto/create-bulk-schedule-entry.dto";


@Controller({
  path: "schedule-entries",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ScheduleEntriesController {
  constructor(
    private readonly scheduleEntriesService: ScheduleEntriesService,
  ) { }

  @Post()
  @Roles("SUPER", "SYSTEM_ADMIN", "DEPARTMENT_HEAD", "NIGHT_SUPERVISOR", "SUPERVISOR",)
  @Permissions("CREATE_SCHEDULE_ENTRY")
  create(@Body() dto: CreateScheduleEntryDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.scheduleEntriesService.create(dto, userOrg);
  }

  @Post("bulk")
  @Roles("SUPER", "SYSTEM_ADMIN", "DEPARTMENT_HEAD", "NIGHT_SUPERVISOR", "SUPERVISOR",)
  @Permissions("CREATE_SCHEDULE_ENTRY")
  createBulk(@Body() dto: CreateBulkScheduleEntryDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.scheduleEntriesService.createBulk(dto, userOrg);
  }

  @Get()
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "DEPARTMENT_HEAD", "NIGHT_SUPERVISOR", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR")
  @Permissions("VIEW_SCHEDULE_ENTRIES")
  findAll(@Query() query: ScheduleEntryFilterDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.scheduleEntriesService.findAll(query, userOrg);
  }

  /**
   * Estadísticas de cobertura del conjunto filtrado (total, estados,
   * emergencias y distribución por plantilla de turno).
   * Permite mantener indicadores precisos cuando la lista va paginada.
   */
  @Get("stats")
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "DEPARTMENT_HEAD", "NIGHT_SUPERVISOR", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR")
  @Permissions("VIEW_SCHEDULE_ENTRIES")
  stats(@Query() query: ScheduleEntryFilterDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.scheduleEntriesService.stats(query, userOrg);
  }

  @Patch(":id")
  @Roles("SUPER", "SYSTEM_ADMIN", "DEPARTMENT_HEAD", "NIGHT_SUPERVISOR", "SUPERVISOR",)
  @Permissions("UPDATE_SCHEDULE_ENTRY")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateScheduleEntryDto,
    @CurrentUser() user: any,
  ) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.scheduleEntriesService.update(id, dto, userOrg);
  }

  @Delete(":id")
  @Roles("SUPER", "SYSTEM_ADMIN")
  @Permissions("DELETE_SCHEDULE_ENTRY")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.scheduleEntriesService.remove(id, userOrg);
  }
}
