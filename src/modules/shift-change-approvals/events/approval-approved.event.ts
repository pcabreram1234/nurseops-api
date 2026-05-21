export class ApprovalApprovedEvent {
  constructor(
    public readonly approvalId: string,
    public readonly organizationId: string,
    public readonly approvedById: string,
  ) {}
}
