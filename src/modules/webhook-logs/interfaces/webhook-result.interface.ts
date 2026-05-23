import { WebhookStatus } from '../enums/webhook-status.enum';

export interface WebhookResultStructure {
    status: WebhookStatus;
    statusCode: number;
    errorMessage?: string;
    durationMs: number;
}