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

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { NotificationFilterDto } from "../dto/notification-filter.dto";

@Controller({
  path: "notifications",
  version: "1",
})
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query()
    filters: NotificationFilterDto,
  ) {
    return this.notificationsService.findAll(user, filters);
  }

  @Get("unread-count")
  unreadCount(@CurrentUser() user: any) {
    return this.notificationsService.unreadCount(user);
  }

  @Patch(":id/read")
  markAsRead(@Param("id") id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch("read-all")
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.notificationsService.remove(id, user);
  }
}
