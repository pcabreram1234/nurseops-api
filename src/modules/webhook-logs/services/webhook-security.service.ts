import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookSecurityService {
    sanitizePayload(payload: Record<string, any>): Record<string, any> {
        const serialized = JSON.stringify(payload);
        if (serialized.includes('$regex') || serialized.includes('<script>')) {
            throw new Error('Malicious content blocked by the security engine.');
        }
        return payload;
    }
}