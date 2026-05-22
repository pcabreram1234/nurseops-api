import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ALERT_EVENTS, ALERT_MAX_UNRESOLVED_TIME_MS } from '../constants/operational-alerts.constants';
import { OperationalAlertEscalatedEvent } from '../events/operational-alert-escalated.event';
import { AlertNotificationService } from './alert-notification.service';
import { AlertChannel } from '../enums/alert-channel.enum';

@Injectable()
export class AlertEscalationService {
    private readonly logger = new Logger(AlertEscalationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly notification: AlertNotificationService,
    ) { }

    async escalateToNextTier(alertId: string, reason: string): Promise<void> {
        const alert = await this.prisma.operationalAlert.findUnique({ where: { id: alertId } });
        if (!alert || alert.status === 'RESOLVED') return;

        this.logger.warn(`[AUTOMATIC SCALING]: Alert ${alertId} wasn't treated in time. (Raising rank).`);

        const updated = await this.prisma.operationalAlert.update({
            where: { id: alertId },
            data: { severity: 'CRITICAL' },
        });

        await this.notification.dispatch(alertId, 'CLINICAL_DIRECTOR', AlertChannel.SMS, `CRITICAL: Alert escalated due to inaction: ${reason}`);

        this.eventEmitter.emit(ALERT_EVENTS.ESCALATED, new OperationalAlertEscalatedEvent(alertId, alert.severity, 'TIER_2_CLINICAL_DIRECTOR'));
    }

    /**
     * Evalúa el tiempo de estancamiento de una alerta específica en base a su fecha de creación.
     * Si supera el límite permitido sin resolución, inicia el escalado de rango clínico.
     */
    async aggregateOverloadedTime(alertId: string): Promise<void> {
        // Buscamos la alerta junto con la fecha de creación (createdAt viene por defecto o mapeada en Prisma)
        const alert = await this.prisma.operationalAlert.findUnique({ 
            where: { id: alertId } 
        });

        if (!alert || alert.status === 'RESOLVED' || alert.severity === 'CRITICAL') {
            return;
        }

        // Accedemos a la propiedad de fecha (Asumiendo mapeo estándar o usando el log transaccional)
        // Si tu modelo exacto no guarda `createdAt`, puedes usar una propiedad auxiliar o tomar el tiempo del Job.
        const createdAtTime = (alert as any).createdAt ? new Date((alert as any).createdAt).getTime() : Date.now();
        const timeElapsedMs = Date.now() - createdAtTime;

        this.logger.debug(`[MONITORING]: Alert ${alertId} has been unresolved for ${Math.round(timeElapsedMs / 1000 / 60)} minutes.`);

        // Comprobamos si el tiempo estancado supera el umbral (e.g., 30 minutos)
        if (timeElapsedMs >= ALERT_MAX_UNRESOLVED_TIME_MS) {
            const reason = `Alert exceeded the maximum unresolved limit of ${ALERT_MAX_UNRESOLVED_TIME_MS / 1000 / 60} minutes in the clinical floor.`;
            await this.escalateToNextTier(alertId, reason);
        }
    }
}