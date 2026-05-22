export class OptimizationStartedEvent {
    constructor(
        public readonly runId: string,
        public readonly scheduleId: string,
        public readonly strategy: string,
    ) { }
}