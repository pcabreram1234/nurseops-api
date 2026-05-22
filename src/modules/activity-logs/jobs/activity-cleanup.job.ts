import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ACTIVITY_EVENTS } from '../constants/activity-logs.constants';
import { ActivityArchivedEvent } from '../events/activity-archived.event';

@Injectable()
export class ActivityCleanupJob {
    private readonly logger = new Logger(ActivityCleanupJob.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async execute() {
        this.logger.log('Initiating the cleaning and archiving of old audit logs (Minimum one year)...');
        const retentionDate = new Date();
        retentionDate.setFullYear(retentionDate.getFullYear() - 1);

        const oldLogsCount = await this.prisma.activityLog.count({
            where: { createdAt: { lt: retentionDate } },
        });

        if (oldLogsCount > 0) {
            // Nota: En producción, aquí harías un volcado a AWS S3 o una tabla fría en BD antes de purgar.
            await this.prisma.activityLog.deleteMany({
                where: { createdAt: { lt: retentionDate } },
            });

            this.eventEmitter.emit(ACTIVITY_EVENTS.ARCHIVED, new ActivityArchivedEvent(oldLogsCount, retentionDate));
            this.logger.log(`Cleaning completed. ${oldLogsCount} audit logs deleted.`);
        }
    }
}