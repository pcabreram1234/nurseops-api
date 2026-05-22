import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/database/prisma.service';
import { AlertEscalationService } from '../services/alert-escalation.service';

@Injectable()
export class AlertEscalationJob {
    private readonly logger = new Logger(AlertEscalationJob.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly escalationService: AlertEscalationService,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async execute() {
        this.logger.log('Escaneando alertas estancadas sin resolución en planta...');
        const criticalTime = new Date(Date.now() - 30 * 60 * 1000);

        const stalledAlerts = await this.prisma.operationalAlert.findMany({
            where: {
                status: 'IN_PROGRESS',
                severity: { not: 'CRITICAL' },
            },
        });

        for (const alert of stalledAlerts) {
            await this.escalationService.aggregateOverloadedTime(alert.id);
        }
    }
}