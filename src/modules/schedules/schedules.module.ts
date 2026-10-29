import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";

import { PrismaModule } from "@infra/database/prisma.module";

import { SchedulesController } from "./controllers/schedules.controller";
import { SchedulesPublicationController } from "./controllers/schedule-publication.controller";

import { SchedulesService } from "./services/schedules.service";
import { SchedulePublicationService } from "./services/schedule-publication.service";
import { ScheduleValidationService } from "./services/schedule-validation.service";
import { ScheduleVersionService } from "./services/schedule-version.service";

import { ValidationController } from "./controllers/schedule-validation.controller";

import { SchedulesGateway } from "./gateways/schedules.gateway";

import { SchedulePublishedListener } from "./listeners/schedule-published.listener";

import { NotificationsModule } from "@modules/notifications/notifications.module";
import { NotificationTemplatesModule } from "@modules/notification-templates/notification-templates.module";

import { TemplateRendererService } from "@modules/notification-templates/services/template-renderer.service";

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: "notifications",
    }),
    NotificationsModule,
    NotificationTemplatesModule,
  ],

  controllers: [SchedulesController, SchedulesPublicationController, ValidationController],

  providers: [
    SchedulesService,
    SchedulePublicationService,
    ScheduleValidationService,
    ScheduleVersionService,
    SchedulesGateway,
    SchedulePublishedListener,
    TemplateRendererService
  ],

  exports: [SchedulesService, SchedulePublicationService, ScheduleValidationService, ScheduleVersionService],
})
export class SchedulesModule { }
