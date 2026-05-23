import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebhookCleanupService } from '../services/webhook-cleanup.service';

@Injectable()
export class WebhookCleanupJob {
    private readonly logger = new Logger(WebhookCleanupJob.name);

    constructor(private readonly cleanup: WebhookCleanupService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async executePruning() {
        this.logger.log('Running scheduled daily cleanup of historical webhook logs...');
        await this.cleanup.pruneLogs(30); // 30 días de retención
    }
}