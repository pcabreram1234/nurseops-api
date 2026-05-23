import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards
} from "@nestjs/common";

import { NotificationTemplatesService } from "../services/notification-templates.service";
import { CreateNotificationTemplateDto } from "../dto/create-notification-template.dto";
import { UpdateNotificationTemplateDto } from "../dto/update-notification-template.dto";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { Permissions } from "@modules/auth/decorators/permissions.decorator";


@Controller("notification-templates",)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationTemplatesController {
    constructor(
        private readonly service: NotificationTemplatesService,
    ) { }

    @Post()
    @Permissions("CREATE_NOTIFICATION_TEMPLATE")
    create(@Body() dto: CreateNotificationTemplateDto,
    ) {
        return this.service.create(dto,);
    }

    @Get()
    @Permissions("FIND_ALL_NOTIFICATIONS_TEMPLATES")
    findAll() {
        return this.service.findAll({}, {},);
    }

    @Get(":id")
    @Permissions("FIND_ONE_NOTIFICATION_TEMPLATE")
    findOne(@Param("id") id: string,) {
        return this.service.findOne(id, {},);
    }

    @Patch(":id")
    @Permissions("UPDATE_NOTIFICATION_TEMPLATE")
    update(@Param("id") id: string, @Body() dto: UpdateNotificationTemplateDto,) {
        return this.service.update(
            id,
            dto,
        );
    }

    @Delete(":id")
    @Permissions("DELETE_NOTIFICATION_TEMPLATE")
    remove(@Param("id") id: string,) {
        return this.service.remove(id,);
    }
}