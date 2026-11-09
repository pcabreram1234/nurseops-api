import { Controller, Patch, Param, UseGuards, Body } from "@nestjs/common";

import { SchedulePublicationService, UserOrgContext } from "../services/schedule-publication.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { PublishScheduleDto } from "../dto/publish-schedule.dto";

@Controller({
  path: "schedules-publication",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SchedulesPublicationController {
  constructor(
    private readonly SchedulePublicationService: SchedulePublicationService,
  ) { }

  @Patch(":id/publish")
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "DEPARTMENT_HEAD")
  @Permissions("PUBLISH_SCHEDULE")
  publish(@Param("id") id: string, @Body() dto: PublishScheduleDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
      id: user?.id || user?.sub,
    };
    return this.SchedulePublicationService.publish(id, dto, userOrg);
  }
}
