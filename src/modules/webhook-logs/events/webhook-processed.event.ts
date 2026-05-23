export class WebhookProcessedEvent {
    constructor(
        public readonly logId: string,
        public readonly status: string,
        public readonly statusCode: number,
    ) { }
}