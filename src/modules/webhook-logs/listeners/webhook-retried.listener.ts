import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WEBHOOK_EVENTS } from '../constants/webhook-logs.constants';
import { WebhookRetriedEvent } from '../events/webhook-retried.event';

@Injectable()
export class WebhookRetriedListener {
    private readonly logger = new Logger(WebhookRetriedListener.name);

    @OnEvent(WEBHOOK_EVENTS.RETRIED)
    handleWebhookRetry(event: WebhookRetriedEvent) {
        this.logger.log(`[RETRY TRACE]: Webhook ${event.logId} re-queued on attempt number ${event.attemptNumber}`);
    }
}