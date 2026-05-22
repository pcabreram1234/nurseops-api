import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from "@nestjs/common";

import { NotificationTypesService } from "../services/notification-types.service";

@Controller("notification-types")
export class NotificationTypesController {
    constructor(
        private readonly service: NotificationTypesService,
    ) { }

    @Post()
    create(
        @Body()
        dto: any,
    ) {
        return this.service.create(
            dto,
        );
    }

    @Get()
    findAll(
        @Query()
        filters: any,
    ) {
        return this.service.findAll(
            filters,
            {},
        );
    }

    @Get(":id")
    findOne(
        @Param("id")
        id: string,
    ) {
        return this.service.findOne(
            id,
            {},
        );
    }

    @Patch(":id")
    update(
        @Param("id")
        id: string,

        @Body()
        dto: any,
    ) {
        return this.service.update(
            id,
            dto,
        );
    }

    @Delete(":id")
    remove(
        @Param("id")
        id: string,
    ) {
        return this.service.remove(
            id,
        );
    }
}