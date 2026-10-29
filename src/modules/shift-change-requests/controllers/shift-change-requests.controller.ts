import {
    Body, Controller, Get, Param, Patch, Post, Query, UseGuards,
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

    // 🐛 FIX: SUPER añadido a todos los accesos — es el rol global y antes
    // recibía 403 al consultar/crear solicitudes (no estaba en @Roles).
    @Post()
    @Roles("SUPER", "ADMIN", "NURSE", "SUPERVISOR")
    create(@Body() dto: CreateShiftChangeRequestDto, @CurrentUser() user: any) {
        return this.service.create(dto, user);
    }

    @Get()
    @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
    findAll(@Query() query: ShiftChangeFilterDto, @CurrentUser() user: any) {
        return this.service.findAll(query, user);
    }

    @Get(":id")
    @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
    findOne(@Param("id") id: string, @CurrentUser() user: any) {
        return this.service.findOne(id, user);
    }

    @Patch(":id")
    @Roles("SUPER", "ADMIN")
    update(@Param("id") id: string, @Body() dto: UpdateShiftChangeRequestDto, @CurrentUser() user: any,) {
        return this.service.update(id, dto, user);
    }

    @Patch(":id/approve")
    @Roles("SUPER", "ADMIN", "SUPERVISOR")
    approve(@Param("id") id: string, @Body() dto: ApproveShiftChangeDto, @CurrentUser() user: any
    ) {
        // 🐛 FIX: approverId no podía resolverse como parámetro crudo (sin decorador)
        return this.service.approve(id, user?.id || user?.sub, dto, user);
    }

    @Patch(":id/reject")
    @Roles("SUPER", "ADMIN", "SUPERVISOR")
    reject(@Param("id") id: string, @Body() dto: RejectShiftChangeDto, @CurrentUser() user: any
    ) {
        return this.service.reject(id, user?.id || user?.sub, dto, user);
    }

    @Patch(":id/cancel")
    @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
    cancel(@Param("id") id: string, @CurrentUser() user: any
    ) {
        return this.service.cancel(id, user);
    }
}