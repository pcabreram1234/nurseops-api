import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { ResolveOperationalAlertDto } from '../dto/resolve-operational-alert.dto';
import { AlertResolutionValidator } from '../validators/alert-resolution.validator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ALERT_EVENTS } from '../constants/operational-alerts.constants';
import { OperationalAlertResolvedEvent } from '../events/operational-alert-resolved.event';
import { UserOrgContext } from './operational-alerts.service';

@Injectable()
export class AlertResolutionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly validator: AlertResolutionValidator,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async resolve(alertId: string, dto: ResolveOperationalAlertDto, userOrg?: UserOrgContext) {
        const where: any = { id: alertId };

        // Aislamiento: usuarios no-SUPER solo pueden resolver alertas de su organización
        if (userOrg && userOrg.role !== 'SUPER') {
            if (userOrg.organizationId) {
                where.organizationId = userOrg.organizationId;
            }
        }

        const alert = await this.prisma.operationalAlert.findUnique({ where });
        if (!alert) throw new NotFoundException('Alert not found or not accessible from your organization.');

        this.validator.validateCurrentState(alert.status);

        const updated = await this.prisma.operationalAlert.update({
            where: { id: alertId },
            data: { status: 'RESOLVED' },
        });

        // Guardar traza en logs de auditoría simulado (o en tu tabla AuditLog si aplica)
        this.eventEmitter.emit(ALERT_EVENTS.RESOLVED, new OperationalAlertResolvedEvent(alertId, dto.resolvedById, dto.resolutionNotes));
        return updated;
    }
}