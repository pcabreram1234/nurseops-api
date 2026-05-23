import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WEBHOOK_EVENTS } from '../constants/webhook-logs.constants';

@Injectable()
export class WebhookProcessedListener {
    private readonly logger = new Logger(WebhookProcessedListener.name);

    @OnEvent(WEBHOOK_EVENTS.PROCESSED)
    handleWebhookProcessed(payload: any) {
        this.logger.log(`[LISTENER]: Webhook dispatched and processed asynchronously.`);
    }
}