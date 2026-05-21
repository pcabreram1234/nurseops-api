import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { ShiftChangeRequestsService } from "@modules/shift-change-requests/services/shift-change-requests.service";

import { CreateShiftChangeRequestDto } from "@modules/shift-change-requests/dto/create-shift-change-request.dto";

import { UpdateShiftChangeRequestDto } from "@modules/shift-change-requests/dto/update-shift-change-request.dto";

import { ApproveShiftChangeDto } from "@modules/shift-change-requests/dto/approve-shift-change.dto";

import { RejectShiftChangeDto } from "@modules/shift-change-requests/dto/reject-shift-change.dto";

import { CancelShiftChangeDto } from "@modules/shift-change-requests/dto/cancel-shift-change.dto";

import { ShiftChangeFilterDto } from "@modules/shift-change-requests/dto/shift-change-filter.dto";

@Controller({
    path: "shift-change-requests",
    version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftChangeRequestsController {
    constructor(private readonly service: ShiftChangeRequestsService) { }

    @Post()
    @Roles("ADMIN", "NURSE")
    create(@Body() dto: CreateShiftChangeRequestDto) {
        return this.service.create(dto);
    }

    @Get()
    @Roles("ADMIN", "SUPERVISOR", "NURSE")
    findAll(@Query() query: ShiftChangeFilterDto, @CurrentUser() user: any) {
        return this.service.findAll(query, user);
    }

    @Get(":id")
    @Roles("ADMIN", "SUPERVISOR", "NURSE")
    findOne(@Param("id") id: string) {
        return this.service.findOne(id);
    }

    @Patch(":id")
    @Roles("ADMIN")
    update(
        @Param("id") id: string,
        @Body() dto: UpdateShiftChangeRequestDto,
        @CurrentUser() user: any,
    ) {
        return this.service.update(id, dto, user);
    }

    @Patch(":id/approve")
    @Roles("ADMIN", "SUPERVISOR")
    approve(@Param("id") id: string, approverId: string, @Body() dto: ApproveShiftChangeDto,
    ) {
        return this.service.approve(id, approverId, dto);
    }

    @Patch(":id/reject")
    @Roles("ADMIN", "SUPERVISOR")
    reject(@Param("id") id: string, approverId: string, @Body() dto: RejectShiftChangeDto,
    ) {
        return this.service.reject(id, approverId, dto);
    }

    @Patch(":id/cancel")
    @Roles("ADMIN", "SUPERVISOR", "NURSE")
    cancel(@Param("id") id: string,
    ) {
        return this.service.cancel(id);
    }
}
