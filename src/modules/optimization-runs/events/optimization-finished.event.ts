export class OptimizationFinishedEvent {
    constructor(
        public readonly runId: string,
        public readonly scheduleId: string,
        public readonly metrics: any,
    ) { }
}