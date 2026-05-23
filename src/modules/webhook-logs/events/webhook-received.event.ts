export class WebhookReceivedEvent {
    constructor(
        public readonly integrationId: string,
        public readonly payload: Record<string, any>,
    ) { }
}