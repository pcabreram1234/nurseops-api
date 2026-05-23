import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class WebhookPayloadValidator {
    validateStructure(payload: any): void {
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            throw new BadRequestException('The webhook payload must be a valid structured JSON object.');
        }
    }
}