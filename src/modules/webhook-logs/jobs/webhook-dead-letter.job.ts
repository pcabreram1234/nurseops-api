import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class WebhookDeadLetterJob {
    private readonly logger = new Logger(WebhookDeadLetterJob.name);

    @Cron(CronExpression.EVERY_HOUR)
    inspectDeadLetterQueue() {
        this.logger.log('Analyzing the Dead Letter Queue (DLQ) to alert about permanently hung webhooks.');
    }
}