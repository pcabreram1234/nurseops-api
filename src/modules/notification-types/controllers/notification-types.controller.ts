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

@Controller("notification-types")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Roles("SUPER")
export class NotificationTypesController {
    constructor(
        private readonly service: NotificationTypesService,
    ) { }

    @Post()
    create(@Body() dto: CreateNotificationTypeDto,) {
        return this.service.create(
            dto,
        );
    }

    @Get()
    findAll(@Query() filters: NotificationTypeFilterDto,) {
        return this.service.findAll(filters, {},);
    }

    @Get(":id")
    findOne(@Param("id") id: string,) {
        return this.service.findOne(
            id,
            {},
        );
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() dto: UpdateNotificationTypeDto,) {
        return this.service.update(
            id,
            dto,
        );
    }

    @Delete(":id")
    remove(@Param("id") id: string,) {
        return this.service.remove(id,);
    }
}