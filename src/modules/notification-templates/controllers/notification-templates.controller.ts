import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from "@nestjs/common";

import { NotificationTemplatesService } from "../services/notification-templates.service";
import { CreateNotificationTemplateDto } from "../dto/create-notification-template.dto";
import { UpdateNotificationTemplateDto } from "../dto/update-notification-template.dto";

@Controller(
    "notification-templates",
)
export class NotificationTemplatesController {
    constructor(
        private readonly service: NotificationTemplatesService,
    ) { }

    @Post()
    create(@Body() dto: CreateNotificationTemplateDto,
    ) {
        return this.service.create(dto,);
    }

    @Get()
    findAll() {
        return this.service.findAll({}, {},);
    }

    @Get(":id")
    findOne(@Param("id") id: string,) {
        return this.service.findOne(id, {},);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() dto: UpdateNotificationTemplateDto,) {
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