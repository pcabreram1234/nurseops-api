export class ActivityEscalatedEvent {
    constructor(
        public readonly logId: string,
        public readonly reason: string,
        public readonly payload: Record<string, any>,
    ) { }
}