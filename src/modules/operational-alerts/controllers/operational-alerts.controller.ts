import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OperationalAlertsService, UserOrgContext } from '../services/operational-alerts.service';
import { AlertResolutionService } from '../services/alert-resolution.service';
import { AlertEscalationService } from '../services/alert-escalation.service';
import { OperationalAlertFilterDto } from '../dto/operational-alert-filter.dto';
import { ResolveOperationalAlertDto } from '../dto/resolve-operational-alert.dto';
import { EscalateOperationalAlertDto } from '../dto/escalate-operational-alert.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guards';

import { Roles } from '@modules/auth/decorators/roles.decorator';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@modules/auth/decorators/permissions.decorator';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';

@Controller({ path: 'operational-alerts', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class OperationalAlertsController {
    constructor(
        private readonly alertsService: OperationalAlertsService,
        private readonly resolutionService: AlertResolutionService,
        private readonly escalationService: AlertEscalationService,
    ) { }

    @Get()
    @Roles('SUPER', 'SYSTEM_ADMIN', 'SUPERVISOR', 'NIGHT_SUPERVISOR')
    @Permissions('VIEW_OPERATIONAL_ALERTS')
    findAll(@Query() query: OperationalAlertFilterDto, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            role: user?.role,
        };
        return this.alertsService.findAll(query, userOrg);
    }

    /**
     * Agregados del conjunto filtrado (totales por estado y severidad)
     * para mantener los indicadores precisos con lista paginada.
     * IMPORTANTE: declarado antes de `GET :id` para evitar captura de ruta.
     */
    @Get('stats')
    @Roles('SUPER', 'SYSTEM_ADMIN', 'SUPERVISOR', 'NIGHT_SUPERVISOR')
    @Permissions('VIEW_OPERATIONAL_ALERTS')
    stats(@Query() query: OperationalAlertFilterDto, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            role: user?.role,
        };
        return this.alertsService.stats(query, userOrg);
    }

    @Get(':id')
    @Roles('SUPER', 'SYSTEM_ADMIN', 'SUPERVISOR', 'NIGHT_SUPERVISOR')
    @Permissions('VIEW_OPERATIONAL_ALERTS')
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            role: user?.role,
        };
        return this.alertsService.findOne(id, userOrg);
    }

    @Post(':id/resolve')
    @Roles('SUPER', 'SYSTEM_ADMIN', 'SUPERVISOR', 'NIGHT_SUPERVISOR')
    @Permissions('RESOLVE_OPERATIONAL_ALERTS')
    resolve(@Param('id') id: string, @Body() dto: ResolveOperationalAlertDto, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            role: user?.role,
        };
        return this.resolutionService.resolve(id, dto, userOrg);
    }

    /**
     * Escalación manual de una alerta: eleva la severidad a CRITICAL
     * y marca el estado ESCALATED (dependencia #2 del plan de entregables).
     */
    @Post(':id/escalate')
    @Roles('SUPER', 'SYSTEM_ADMIN', 'SUPERVISOR', 'NIGHT_SUPERVISOR')
    @Permissions('RESOLVE_OPERATIONAL_ALERTS')
    async escalate(@Param('id') id: string, @Body() dto: EscalateOperationalAlertDto, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            role: user?.role,
        };
        await this.escalationService.escalateToNextTier(id, dto.reason, userOrg);
        return this.alertsService.findOne(id, userOrg);
    }
}
