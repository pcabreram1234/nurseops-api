import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class OptimizationCleanupJob {
    private readonly logger = new Logger(OptimizationCleanupJob.name);

    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async clearOldRunsLogs() {
        this.logger.log('Initiating regulatory cleanup of legacy optimization executionss...');
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() - 6);

        const deletion = await this.prisma.optimizationRun.deleteMany({
            where: { startedAt: { lt: expirationDate } },
        });

        this.logger.log(`Purge completed. Deleted ${deletion.count} obsolete history records.`);
    }
}