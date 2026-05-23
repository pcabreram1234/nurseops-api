import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class WebhookMonitoringJob {
    private readonly logger = new Logger(WebhookMonitoringJob.name);

    @Cron(CronExpression.EVERY_MINUTE)
    checkQueueHealth() {
        this.logger.debug('[VITAL-CHECK]: Checking the health and latency of the transactional webhook pool.');
    }
}