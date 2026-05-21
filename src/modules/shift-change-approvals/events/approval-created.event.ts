export class ApprovalCreatedEvent {
  constructor(
    public readonly approvalId: string,
    public readonly organizationId: string,
    public readonly requestingNurseId: string,
  ) {}
}
