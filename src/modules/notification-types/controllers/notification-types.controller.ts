import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards
} from "@nestjs/common";

import { NotificationTypesService } from "../services/notification-types.service";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { CreateNotificationTypeDto } from "../dto/create-notification-type.dto";
import { NotificationTypeFilterDto } from "@modules/notification-types/dto/notification-type-filter.dto";
import { UpdateNotificationTypeDto } from "../dto/update-notification-type.dto";
import { Permissions } from "@modules/auth/decorators/permissions.decorator";
import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller("notification-types")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Roles("SUPER")
export class NotificationTypesController {
    constructor(
        private readonly service: NotificationTypesService,
    ) { }

    @Post()
    @Permissions(PERMISSIONS.NOTIFICATION_TYPES.CREATE)
    create(@Body() dto: CreateNotificationTypeDto,) {
        return this.service.create(
            dto,
        );
    }

    @Get()
    @Permissions(PERMISSIONS.NOTIFICATION_TYPES.READ)
    findAll(@Query() filters: NotificationTypeFilterDto,) {
        return this.service.findAll(filters, {},);
    }

    @Get(":id")
    @Permissions(PERMISSIONS.NOTIFICATION_TYPES.READ)
    findOne(@Param("id") id: string,) {
        return this.service.findOne(
            id,
            {},
        );
    }

    @Patch(":id")
    @Permissions(PERMISSIONS.NOTIFICATION_TYPES.UPDATE)
    update(@Param("id") id: string, @Body() dto: UpdateNotificationTypeDto,) {
        return this.service.update(
            id,
            dto,
        );
    }

    @Delete(":id")
    @Permissions(PERMISSIONS.NOTIFICATION_TYPES.DELETE)
    remove(@Param("id") id: string,) {
        return this.service.remove(id,);
    }
}