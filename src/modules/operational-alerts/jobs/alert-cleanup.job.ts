import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class AlertCleanupJob {
    private readonly logger = new Logger(AlertCleanupJob.name);

    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_WEEKEND)
    async execute() {
        this.logger.log('Initiating the regulatory purge of resolved alerts older than 90 days..');
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - 90);

        const result = await this.prisma.operationalAlert.deleteMany({
            where: { status: 'RESOLVED', severity: 'MEDIUM' }, // Ejemplo preventivo
        });
        this.logger.log(`Cleaning complete. Removed ${result.count} old alerts.`);
    }
}