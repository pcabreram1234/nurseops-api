import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class WebhookRetryJob {
    private readonly logger = new Logger(WebhookRetryJob.name);

    @Cron(CronExpression.EVERY_5_MINUTES)
    executeRetryQueue() {
        this.logger.log('Scanning failed webhook queue for retry processing...');
    }
}