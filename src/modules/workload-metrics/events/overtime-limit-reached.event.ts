export class OvertimeLimitReachedEvent {
    constructor(
        public readonly nurseId: string,
        public readonly accumulatedOvertime: number,
        public readonly month: number,
    ) { }
}