export class BurnoutDetectedEvent {
    constructor(
        public readonly nurseId: string,
        public readonly organizationId: string,
        public readonly riskScore: number,
    ) { }
}