import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { NotificationTypesController } from "./controllers/notification-types.controller";

import { NotificationTypesService } from "./services/notification-types.service";

import { NotificationTemplateRendererService } from "./services/notification-template-renderer.service";

import { NotificationChannelService } from "./services/notification-channel.service";
import { NotificationAnalyticsService } from "./services/notification-analytics.service"
import { NotificationPriorityService } from "./services/notification-priority.service"
import { NotificationRoutingService } from "./services/notification-routing.service"
import { NotificationSecurityService } from "./services/notification-security.service"


import { NotificationTypesGateway } from "./gateways/notification-types.gateway";

@Module({
    imports: [PrismaModule],

    controllers: [
        NotificationTypesController,
    ],

    providers: [
        NotificationTypesService,

        NotificationTemplateRendererService,

        NotificationChannelService,

        NotificationTypesGateway,
        NotificationAnalyticsService,
        NotificationPriorityService,
        NotificationRoutingService,
        NotificationSecurityService
    ],

    exports: [
        NotificationTypesService,
    ],
})
export class NotificationTypesModule { }