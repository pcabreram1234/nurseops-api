import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

import {
  NotificationChannel,
  SendNotificationDto,
} from "../dto/send-notification.dto";
import { CreateNotificationDto } from "../dto/create-notification.dto";
import { NotificationFilterDto } from "../dto/notification-filter.dto";

import { PushNotificationsService } from "./push-notifications.service";

import { EmailNotificationsService } from "./email-notifications.service";

import { SmsNotificationsService } from "./sms-notifications.service";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly pushService: PushNotificationsService,

    private readonly emailService: EmailNotificationsService,

    private readonly smsService: SmsNotificationsService,

    private readonly eventEmitter: EventEmitter2,
  ) { }

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: dto,
    });
  }

  async findAll(user: any, filters: NotificationFilterDto) {
    return this.prisma.notification.findMany({
      where: {
        organizationId: user.organizationId,

        userId: user.sub,

        ...(filters.unreadOnly && {
          readedAt: null,
        }),
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,

        organizationId: user.organizationId,
      },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    return notification;
  }

  async markAsRead(id: string, user: any) {
    return this.prisma.notification.update({
      where: {
        id: id,
        userId: user.id
      },

      data: {
        readedAt: new Date(),
      },
    });
  }

  async markAllAsRead(user: any) {
    return this.prisma.notification.updateMany({
      where: {
        userId: user.sub,
        readedAt: null,
      },

      data: {
        readedAt: new Date(),
      },
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);
    return this.prisma.notification.delete({
      where: {
        id,
      },
    });
  }

  async unreadCount(user: any) {
    return this.prisma.notification.count({
      where: {
        userId: user.sub,
        readedAt: null,
      },
    });
  }

  async sendBatch(
    userIds: string[],
    organizationId: string,
    title: string,
    message: string,
    channels: NotificationChannel[],
    metadata?: Record<string, any>,
  ) {
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        phone: true,
        pushTokens: true,
      },
    });

    const results: Record<string, { success: boolean; error?: string }> = {};

    if (channels.includes(NotificationChannel.EMAIL)) {
      const recipients = users
        .filter((u) => u.email)
        .map((u) => ({ email: u.email, name: u.email }));
      results["email"] = {
        success: await this.emailService.sendEmail(recipients, title, message),
      };
    }

    if (channels.includes(NotificationChannel.PUSH)) {
      const recipients = users
        .filter((u) => u.pushTokens)
        .map((u) => ({ pushTokens: (u.pushTokens as string[]) || [] }));
      results["push"] = {
        success: await this.pushService.sendPushNotification(recipients, title, message),
      };
    }

    if (channels.includes(NotificationChannel.SMS)) {
      const recipients = users
        .filter((u): u is typeof u & { phone: string } => !!u.phone)
        .map((u) => ({ phone: u.phone }));
      results["sms"] = {
        success: await this.smsService.sendSMS(recipients, message),
      };
    }

    if (channels.includes("WHATSAPP" as NotificationChannel)) {
      const recipients = users
        .filter((u): u is typeof u & { phone: string } => !!u.phone)
        .map((u) => ({ phone: u.phone }));
      results["whatsapp"] = {
        success: await this.smsService.sendWhatsApp(recipients, message),
      };
    }

    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        organizationId,
        title,
        message,
        priority: "MEDIUM" as any,
        data: metadata || {},
      })),
    });

    this.eventEmitter.emit("notification.sent", {
      userIds,
      channels,
      results,
    });

    return { sent: users.length, channels: results };
  }

  async send(dto: SendNotificationDto) {
    const channels = dto.channels || [];

    const users = await this.prisma.user.findMany({
      where: { id: { in: dto.recipients } },
      select: {
        id: true,
        email: true,
        phone: true,
        pushTokens: true,
      },
    });

    if (channels.includes(NotificationChannel.PUSH)) {
      const pushRecipients = users
        .filter((u) => u.pushTokens)
        .map((u) => ({ pushTokens: (u.pushTokens as string[]) || [] }));
      await this.pushService.sendPushNotification(
        pushRecipients,
        dto.title,
        dto.message,
      );
    }

    if (channels.includes(NotificationChannel.EMAIL)) {
      const emailRecipients = users
        .filter((u) => u.email)
        .map((u) => ({ email: u.email, name: u.email }));
      await this.emailService.sendEmail(
        emailRecipients,
        dto.title,
        dto.message,
      );
    }

    if (channels.includes(NotificationChannel.SMS)) {
      const smsRecipients = users
        .filter((u): u is typeof u & { phone: string } => !!u.phone)
        .map((u) => ({ phone: u.phone }));
      await this.smsService.sendSMS(
        smsRecipients,
        dto.message,
      );
    }

    this.eventEmitter.emit("notification.sent", {
      recipients: dto.recipients,
    });

    return {
      success: true,
    };
  }
}
