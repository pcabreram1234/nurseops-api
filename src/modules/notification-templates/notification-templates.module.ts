import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { NotificationTemplatesController } from "./controllers/notification-templates.controller";

import { NotificationTemplatesService } from "./services/notification-templates.service";

import { TemplateRendererService } from "./services/template-renderer.service";

import { TemplatePreviewService } from "./services/template-preview.service";

import { TemplateVersioningService } from "./services/template-versioning.service";

import { NotificationTemplatesGateway } from "./gateways/notification-templates.gateway";

@Module({
    imports: [PrismaModule],

    controllers: [
        NotificationTemplatesController,
    ],

    providers: [
        NotificationTemplatesService,

        TemplateRendererService,

        TemplatePreviewService,

        TemplateVersioningService,

        NotificationTemplatesGateway,
    ],

    exports: [
        NotificationTemplatesService,
    ],
})
export class NotificationTemplatesModule { }