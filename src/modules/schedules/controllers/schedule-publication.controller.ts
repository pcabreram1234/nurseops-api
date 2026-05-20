import { Controller, Patch, Param, UseGuards, Body } from "@nestjs/common";

import { SchedulePublicationService } from "../services/schedule-publication.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { PublishScheduleDto } from "../dto/publish-schedule.dto";

@Controller({
  path: "schedules-publication",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SchedulesPublicationController {
  constructor(
    private readonly SchedulePublicationService: SchedulePublicationService,
  ) {}

  @Patch(":id/publish")
  @Permissions("PUBLISH_SCHEDULE")
  publish(@Param("id") id: string, @Body() dto: PublishScheduleDto, @CurrentUser() user: any) {
    return this.SchedulePublicationService.publish(id, dto, user);
  }
}
