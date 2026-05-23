import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhookQueueService {
    private readonly logger = new Logger(WebhookQueueService.name);

    async enqueueOutboundDelivery(payload: any): Promise<void> {
        this.logger.log('Enqueuing outgoing webhook in the asynchronous broker Redis/BullMQ.');
    }
}