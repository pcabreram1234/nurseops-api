import { WebhookDirection } from '../enums/webhook-direction.enum';
import { WebhookProvider } from '../enums/webhook-provider.enum';

export interface WebhookContext {
    ipAddress: string;
    userAgent: string;
    direction: WebhookDirection;
    provider: WebhookProvider;
    signature?: string;
}