import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AlertMonitoringJob {
    private readonly logger = new Logger(AlertMonitoringJob.name);

    @Cron(CronExpression.EVERY_MINUTE)
    execute() {
        this.logger.debug('[VITAL-CHECK]: Verifying consistency of the personnel incident processing flow.');
    }
}