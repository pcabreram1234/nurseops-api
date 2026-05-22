export class WorkloadImbalancedEvent {
    constructor(
        public readonly organizationId: string,
        public readonly varianceValue: number,
        public readonly staffInvolvedCount: number,
    ) { }
}