import { Injectable, PayloadTooLargeException } from '@nestjs/common';
import { WEBHOOK_CONFIG } from '../constants/webhook-logs.constants';

@Injectable()
export class WebhookSizeValidator {
    validateSize(contentLength: number): void {
        if (contentLength > WEBHOOK_CONFIG.MAX_PAYLOAD_SIZE_BYTES) {
            throw new PayloadTooLargeException(
                `The size of the webhook exceeds the allowed structural limit of ${WEBHOOK_CONFIG.MAX_PAYLOAD_SIZE_BYTES / 1024 / 1024}MB.`,
            );
        }
    }
}