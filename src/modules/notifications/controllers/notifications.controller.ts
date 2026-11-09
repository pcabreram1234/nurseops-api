import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";

import { NotificationsService } from "../services/notifications.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { NotificationFilterDto } from "../dto/notification-filter.dto";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { Permissions } from "@modules/auth/decorators/permissions.decorator";

@Controller({
  path: "notifications",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  @Roles("SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NIGHT_SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE")
  @Permissions("VIEW_NOTIFICATIONS")
  findAll(
    @CurrentUser() user: any,
    @Query() filters: NotificationFilterDto,) {
    return this.notificationsService.findAll(user, filters);
  }

  @Get("unread-count")
  @Roles("SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NIGHT_SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE")
  unreadCount(@CurrentUser() user: any) {
    return this.notificationsService.unreadCount(user);
  }

  @Patch(":id/read")
  @Roles("SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NIGHT_SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE")
  markAsRead(@Param("id") id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user);
  }

  @Patch("read-all")
  @Roles("SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NIGHT_SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE")
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user);
  }

  @Delete(":id")
  @Roles("SUPER", "SYSTEM_ADMIN")
  @Permissions("DELETE_NOTIFICATION")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.notificationsService.remove(id, user);
  }
}