export class OperationalAlertCriticalEvent {
    constructor(
        public readonly alertId: string,
        public readonly departmentName: string,
        public readonly rawPayload: Record<string, any>,
    ) { }
}