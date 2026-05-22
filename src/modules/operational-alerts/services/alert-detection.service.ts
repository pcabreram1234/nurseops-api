import { Injectable, Logger } from '@nestjs/common';
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

    async triggerAutomatedAlert(departmentId: string, type: OperationalAlertyTypes, ctx: Record<string, any>) {
        this.logger.log(`[DETECTOR]: New anomaly detected at the plant. Evaluating the record...`);

        const severity = this.priorityService.determinePriority(type, ctx);

        const alert = await this.prisma.operationalAlert.create({
            data: {
                departmentId,
                alertType: type,
                severity,
                status: 'IN_PROGRESS',
            },
        });

        const msg = `Operational alert of type ${type} detected with severity ${severity}.`;
        await this.routingService.routeAlertToDepartmentSupervisor(alert.id, departmentId, msg);

        this.eventEmitter.emit(ALERT_EVENTS.CREATED, new OperationalAlertCreatedEvent(alert.id, departmentId, type, severity));
        return alert;
    }
}