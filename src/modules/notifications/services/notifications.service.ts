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

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: dto,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ALL
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | FIND ONE
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | MARK AS READ
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | MARK ALL AS READ
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  async remove(id: string, user: any) {
    await this.findOne(id, user);
    return this.prisma.notification.delete({
      where: {
        id,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | UNREAD COUNT
  |--------------------------------------------------------------------------
  */

  async unreadCount(user: any) {
    return this.prisma.notification.count({
      where: {
        userId: user.sub,
        readedAt: null,
      },
    });
  }

  async send(dto: SendNotificationDto) {
    const channels = dto.channels || [];

    /*
    |--------------------------------------------------------------------------
    | PUSH
    |--------------------------------------------------------------------------
    */

    if (channels.includes(NotificationChannel.PUSH)) {
      await this.pushService.sendPushNotification(
        dto.recipients,

        dto.title,

        dto.message,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | EMAIL
    |--------------------------------------------------------------------------
    */

    if (channels.includes(NotificationChannel.EMAIL)) {
      await this.emailService.sendEmail(
        dto.recipients,

        dto.title,

        dto.message,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SMS
    |--------------------------------------------------------------------------
    */

    if (channels.includes(NotificationChannel.SMS)) {
      await this.smsService.sendSMS(
        dto.recipients,

        dto.message,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | EVENTS
    |--------------------------------------------------------------------------
    */

    this.eventEmitter.emit("notification.sent", {
      recipients: dto.recipients,
    });

    return {
      success: true,
    };
  }
}
