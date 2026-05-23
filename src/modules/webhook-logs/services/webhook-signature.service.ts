import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSignatureService {
    computeHmacSha256(payload: string, secret: string): string {
        return crypto.createHmac('sha256', secret).update(payload).digest('hex');
    }
}