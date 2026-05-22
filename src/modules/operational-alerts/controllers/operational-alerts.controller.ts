import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OperationalAlertsService } from '../services/operational-alerts.service';
import { AlertResolutionService } from '../services/alert-resolution.service';
import { OperationalAlertFilterDto } from '../dto/operational-alert-filter.dto';
import { ResolveOperationalAlertDto } from '../dto/resolve-operational-alert.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@modules/auth/decorators/permissions.decorator';

@Controller({ path: 'operational-alerts', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OperationalAlertsController {
    constructor(
        private readonly alertsService: OperationalAlertsService,
        private readonly resolutionService: AlertResolutionService,
    ) { }

    @Get()
    @Permissions('VIEW_OPERATIONAL_ALERTS')
    findAll(@Query() query: OperationalAlertFilterDto) {
        return this.alertsService.findAll(query);
    }

    @Get(':id')
    @Permissions('VIEW_OPERATIONAL_ALERTS')
    findOne(@Param('id') id: string) {
        return this.alertsService.findOne(id);
    }

    @Post(':id/resolve')
    @Permissions('RESOLVE_OPERATIONAL_ALERTS')
    resolve(@Param('id') id: string, @Body() dto: ResolveOperationalAlertDto) {
        return this.resolutionService.resolve(id, dto);
    }
}