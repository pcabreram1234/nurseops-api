export class OperationalAlertCreatedEvent {
    constructor(
        public readonly alertId: string,
        public readonly departmentId: string,
        public readonly alertType: string,
        public readonly severity: string,
    ) { }
}