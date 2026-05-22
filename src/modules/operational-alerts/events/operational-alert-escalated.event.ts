export class OperationalAlertEscalatedEvent {
    constructor(
        public readonly alertId: string,
        public readonly previousSeverity: string,
        public readonly newTier: string,
    ) { }
}