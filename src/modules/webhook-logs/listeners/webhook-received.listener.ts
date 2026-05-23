import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WEBHOOK_EVENTS } from '../constants/webhook-logs.constants';
import { WebhookReceivedEvent } from '../events/webhook-received.event';

@Injectable()
export class WebhookReceivedListener {
    private readonly logger = new Logger(WebhookReceivedListener.name);

    @OnEvent(WEBHOOK_EVENTS.RECEIVED)
    handleWebhookReceived(event: WebhookReceivedEvent) {
        this.logger.log(`[INTEGRATION]: New webhook event received for integration: ${event.integrationId}`);
    }
}