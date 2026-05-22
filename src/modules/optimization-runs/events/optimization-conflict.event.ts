export class OptimizationConflictEvent {
    constructor(
        public readonly scheduleId: string,
        public readonly nurseId: string,
        public readonly structuralConflictDetails: string,
    ) { }
}