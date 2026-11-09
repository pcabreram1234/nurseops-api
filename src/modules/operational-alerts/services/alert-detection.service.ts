import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { AlertPriorityService } from './alert-priority.service';
import { AlertRoutingService } from './alert-routing.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OperationalAlertyTypes } from '@prisma/client';
import { ALERT_EVENTS } from '../constants/operational-alerts.constants';
import { OperationalAlertCreatedEvent } from '../events/operational-alert-created.event';

@Injectable()
export class AlertDetectionService {
    private readonly logger = new Logger(AlertDetectionService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly priorityService: AlertPriorityService,
        private readonly routingService: AlertRoutingService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async triggerAutomatedAlert(departmentId: string, type: OperationalAlertyTypes, ctx: Record<string, any>, organizationId?: string) {
        this.logger.log(`[DETECTOR]: New anomaly detected at the plant. Evaluating the record...`);

        // Derivar organizationId del departamento si no se proporciona explícitamente
        let resolvedOrganizationId = organizationId;
        if (!resolvedOrganizationId) {
            const dept = await this.prisma.department.findUnique({
                where: { id: departmentId },
                select: { organizationId: true },
            });
            if (!dept) {
                throw new NotFoundException(`Department ${departmentId} not found.`);
            }
            resolvedOrganizationId = dept.organizationId;
        }

        const severity = this.priorityService.determinePriority(type, ctx);
        const msg = `Operational alert of type ${type} detected with severity ${severity}.`;

        const alert = await this.prisma.operationalAlert.create({
            data: {
                departmentId,
                organizationId: resolvedOrganizationId,
                alertType: type,
                severity,
                status: 'IN_PROGRESS',
                message: msg
            },
        });

        await this.routingService.routeAlertToDepartmentSupervisor(alert.id, departmentId, msg);

        this.eventEmitter.emit(ALERT_EVENTS.CREATED, new OperationalAlertCreatedEvent(alert.id, departmentId, type, severity, resolvedOrganizationId));
        return alert;
    }
}