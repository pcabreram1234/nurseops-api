import { Injectable, Logger } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

import { PrismaService } from "@infra/database/prisma.service";

import { NotificationsService } from "@modules/notifications/services/notifications.service";

import { NotificationChannel } from "@modules/notifications/dto/send-notification.dto";

import { PriorityTypes } from "@prisma/client";

import { TemplateRendererService } from "@modules/notification-templates/services/template-renderer.service";

import { SchedulesGateway } from "../gateways/schedules.gateway";

import { SchedulePublishedEvent } from "../events/schedule-published.event";

@Injectable()
export class SchedulePublishedListener {
  private readonly logger = new Logger(SchedulePublishedListener.name);

  constructor(
    private readonly prisma: PrismaService,

    private readonly gateway: SchedulesGateway,

    private readonly notificationsService: NotificationsService,

    private readonly templateRenderer: TemplateRendererService,
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
        email: true,
        phone: true,
        pushTokens: true,
      },
    });

    if (users.length === 0) return;

    /*
    |--------------------------------------------------------------------------
    | RENDER TEMPLATE (if available)
    |--------------------------------------------------------------------------
    */

    const schedule = await this.prisma.schedule.findUnique({
      where: { id: event.scheduleId },
      select: {
        month: true,
        year: true,
        department: { select: { name: true } },
      },
    });

    const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const periodLabel = schedule
      ? `${months[schedule.month - 1]} ${schedule.year}`
      : "";
    const departmentName = schedule?.department?.name || "";

    const templateVars = {
      scheduleId: event.scheduleId,
      period: periodLabel,
      department: departmentName,
      publishedAt: event.publishedAt.toLocaleDateString(),
    };

    let title = "Nuevo horario publicado";
    let message = `El horario${departmentName ? ` de ${departmentName}` : ""} correspondiente a ${periodLabel} ha sido publicado.`;

    const template = await this.prisma.notificationTemplates.findFirst({
      where: {
        channel: "IN_APP",
        code: "schedule-published",
        organizationId: event.organizationId,
      },
    });

    if (template) {
      title = this.templateRenderer.render(template.titleTemplate || title, templateVars);
      message = this.templateRenderer.render(template.bodyTemplate, templateVars);
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE IN-APP NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    if (event.notifyStaff) {
      await this.prisma.notification.createMany({
        data: users.map((user) => ({
          userId: user.id,
          organizationId: event.organizationId,
          title,
          message,
          priority: PriorityTypes.MEDIUM,
          data: { scheduleId: event.scheduleId },
        })),
      });
    }

    /*
    |--------------------------------------------------------------------------
    | MULTI-CHANNEL DELIVERY
    |--------------------------------------------------------------------------
    */

    const emailRecipients = users.filter((u) => u.email).map((u) => u.id);
    const pushRecipients = users.filter((u) => u.pushTokens).map((u) => u.id);
    const smsRecipients = users.filter((u) => u.phone).map((u) => u.id);

    const activeChannels: NotificationChannel[] = [];

    if (emailRecipients.length > 0) activeChannels.push(NotificationChannel.EMAIL);
    if (pushRecipients.length > 0) activeChannels.push(NotificationChannel.PUSH);
    if (smsRecipients.length > 0) activeChannels.push(NotificationChannel.SMS);

    if (activeChannels.length > 0 && event.notifyStaff) {
      this.notificationsService.sendBatch(
        users.map((u) => u.id),
        event.organizationId,
        title,
        message,
        activeChannels,
        { scheduleId: event.scheduleId },
      ).catch((err) => {
        this.logger.error("Multi-channel notification delivery failed", err);
      });
    }

    this.logger.log(`Schedule notifications sent to ${users.length} users`);
  }
}
