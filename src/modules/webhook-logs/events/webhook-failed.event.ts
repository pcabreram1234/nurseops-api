export class WebhookFailedEvent {
    constructor(
        public readonly logId: string,
        public readonly errorMessage: string,
    ) { }
}