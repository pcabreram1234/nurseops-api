import { Injectable, Logger } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

import { PrismaService } from "@infra/database/prisma.service";

import { NotificationsService } from "@modules/notifications/services/notifications.service";

import { PriorityTypes } from "@prisma/client";

import { SchedulesGateway } from "../gateways/schedules.gateway";

import { SchedulePublishedEvent } from "../events/schedule-published.event";

@Injectable()
export class SchedulePublishedListener {
  private readonly logger = new Logger(SchedulePublishedListener.name);

  constructor(
    private readonly prisma: PrismaService,

    private readonly gateway: SchedulesGateway,

    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent("schedule.published")
  async handleSchedulePublished(event: SchedulePublishedEvent) {
    this.logger.log(`Schedule published: ${event.scheduleId}`);

    /*
    |--------------------------------------------------------------------------
    | REALTIME EVENT
    |--------------------------------------------------------------------------
    */

    this.gateway.emitSchedulePublished({
      scheduleId: event.scheduleId,

      organizationId: event.organizationId,

      publishedAt: event.publishedAt,
    });

    /*
    |--------------------------------------------------------------------------
    | GET ORGANIZATION USERS
    |--------------------------------------------------------------------------
    */

    const users = await this.prisma.user.findMany({
      where: {
        organizationId: event.organizationId,
      },

      select: {
        id: true,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | CREATE NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    if (event.notifyStaff) {
      await Promise.all(
        users.map((user) =>
          this.notificationsService.create({
            userId: user.id,

            organizationId: event.organizationId,

            title: "Nuevo horario publicado",

            message: "El horario mensual ha sido publicado.",

            priority: PriorityTypes.MEDIUM,

            data: {
              scheduleId: event.scheduleId,
            },
          }),
        ),
      );
    }

    this.logger.log("Schedule notifications created");
  }
}
