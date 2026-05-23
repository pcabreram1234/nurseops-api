export class WebhookRetriedEvent {
    constructor(
        public readonly logId: string,
        public readonly attemptNumber: number,
    ) { }
}