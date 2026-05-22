export class OptimizationFailedEvent {
    constructor(
        public readonly scheduleId: string,
        public readonly errorReason: string,
    ) { }
}