export class EmergencyAssignedEvent {
  constructor(
    public readonly coverageId: string,

    public readonly nurseId: string,
  ) {}
}
