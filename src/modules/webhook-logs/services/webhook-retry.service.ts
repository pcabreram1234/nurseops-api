import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WEBHOOK_EVENTS } from '../constants/webhook-logs.constants';
import { WebhookRetriedEvent } from '../events/webhook-retried.event';

@Injectable()
export class WebhookRetryService {
    private readonly logger = new Logger(WebhookRetryService.name);

    constructor(private readonly eventEmitter: EventEmitter2) { }

    async processScheduleRetry(logId: string, currentAttempt: number): Promise<void> {
        this.logger.warn(`[RETRY ENGINE]: Scheduling webhook retry ${logId}. Tried #${currentAttempt}`);
        this.eventEmitter.emit(WEBHOOK_EVENTS.RETRIED, new WebhookRetriedEvent(logId, currentAttempt));
    }
}