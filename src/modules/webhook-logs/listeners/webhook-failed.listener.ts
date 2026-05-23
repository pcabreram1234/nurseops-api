import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WEBHOOK_EVENTS } from '../constants/webhook-logs.constants';
import { WebhookFailedEvent } from '../events/webhook-failed.event';
import { WebhookRetryService } from '../services/webhook-retry.service';

@Injectable()
export class WebhookFailedListener {
    private readonly logger = new Logger(WebhookFailedListener.name);

    constructor(private readonly retryService: WebhookRetryService) { }

    @OnEvent(WEBHOOK_EVENTS.FAILED)
    async handleWebhookFailed(event: WebhookFailedEvent) {
        this.logger.error(`[CRITICAL]: Webhook failure ${event.logId}: ${event.errorMessage}`);
        await this.retryService.processScheduleRetry(event.logId, 1);
    }
}