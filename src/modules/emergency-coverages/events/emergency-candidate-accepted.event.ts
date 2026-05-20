export class EmergencyCandidateAcceptedEvent {
  constructor(
    public readonly coverageId: string,

    public readonly nurseId: string,
  ) {}
}
