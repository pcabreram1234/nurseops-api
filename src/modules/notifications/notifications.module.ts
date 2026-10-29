import { Module } from "@nestjs/common";

import { BullModule } from "@nestjs/bullmq";

import { EventEmitterModule } from "@nestjs/event-emitter";

import { MailModule } from "@infra/mail/mail.module";

import { NotificationsProcessor } from "./processors/notifications.processor";

import { NotificationsService } from "./services/notifications.service";

import { PushNotificationsService } from "./services/push-notifications.service";

import { EmailNotificationsService } from "./services/email-notifications.service";

import { SmsNotificationsService } from "./services/sms-notifications.service";

import { NotificationsGateway } from "./gateways/notifications.gateway";

import { NotificationListener } from "./listeners/notification.listener";

import { NotificationsController } from "./controllers/notifications.controller";

import { TemplateRendererService } from "@modules/notification-templates/services/template-renderer.service";

@Module({
  imports: [
    EventEmitterModule.forRoot(),

    BullModule.registerQueue({
      name: "notifications",
    }),

    MailModule,
  ],

  controllers: [NotificationsController],

  providers: [
    NotificationsProcessor,

    NotificationsService,

    PushNotificationsService,

    EmailNotificationsService,

    SmsNotificationsService,

    NotificationsGateway,

    NotificationListener,

    TemplateRendererService,
  ],

  exports: [NotificationsService],
})
export class NotificationsModule {}
