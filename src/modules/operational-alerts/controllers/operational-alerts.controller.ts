import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OperationalAlertsService } from '../services/operational-alerts.service';
import { AlertResolutionService } from '../services/alert-resolution.service';
import { AlertEscalationService } from '../services/alert-escalation.service';
import { OperationalAlertFilterDto } from '../dto/operational-alert-filter.dto';
import { ResolveOperationalAlertDto } from '../dto/resolve-operational-alert.dto';
import { EscalateOperationalAlertDto } from '../dto/escalate-operational-alert.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@modules/auth/decorators/permissions.decorator';

@Controller({ path: 'operational-alerts', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OperationalAlertsController {
    constructor(
        private readonly alertsService: OperationalAlertsService,
        private readonly resolutionService: AlertResolutionService,
        private readonly escalationService: AlertEscalationService,
    ) { }

    @Get()
    @Permissions('VIEW_OPERATIONAL_ALERTS')
    findAll(@Query() query: OperationalAlertFilterDto) {
        return this.alertsService.findAll(query);
    }

    /**
     * Agregados del conjunto filtrado (totales por estado y severidad)
     * para mantener los indicadores precisos con lista paginada.
     * IMPORTANTE: declarado antes de `GET :id` para evitar captura de ruta.
     */
    @Get('stats')
    @Permissions('VIEW_OPERATIONAL_ALERTS')
    stats(@Query() query: OperationalAlertFilterDto) {
        return this.alertsService.stats(query);
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

    /**
     * Escalación manual de una alerta: eleva la severidad a CRITICAL
     * y marca el estado ESCALATED (dependencia #2 del plan de entregables).
     */
    @Post(':id/escalate')
    @Permissions('RESOLVE_OPERATIONAL_ALERTS')
    async escalate(@Param('id') id: string, @Body() dto: EscalateOperationalAlertDto) {
        await this.escalationService.escalateToNextTier(id, dto.reason);
        return this.alertsService.findOne(id);
    }
}