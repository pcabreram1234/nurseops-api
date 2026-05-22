export class FatigueThresholdReachedEvent {
    constructor(
        public readonly nurseId: string,
        public readonly fatigueScore: number,
        public readonly departmentId?: string,
    ) { }
}