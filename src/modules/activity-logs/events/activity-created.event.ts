export class ActivityCreatedEvent {
    constructor(
        public readonly logId: string,
        public readonly userId: string,
        public readonly action: string,
        public readonly severity: string,
    ) { }
}