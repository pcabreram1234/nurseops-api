export class OperationalAlertResolvedEvent {
    constructor(
        public readonly alertId: string,
        public readonly resolvedById: string,
        public readonly notes: string,
    ) { }
}