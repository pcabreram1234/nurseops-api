export interface IWebhookProviderStrategy {
    validateSignature(payload: string, signature: string, secret: string): boolean;
    parsePayload(payload: any): Record<string, any>;
}