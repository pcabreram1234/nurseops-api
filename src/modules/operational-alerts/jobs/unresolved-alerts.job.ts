import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class UnresolvedAlertsJob {
    private readonly logger = new Logger(UnresolvedAlertsJob.name);

    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_HOUR)
    async execute() {
        const openCount = await this.prisma.operationalAlert.count({ where: { status: 'IN_PROGRESS' } });
        if (openCount > 5) {
            this.logger.error(`[CRÍTICO]: There are ${openCount} unresolved operational alerts in the queue.`);
        }
    }
}