export class ApprovalRejectedEvent {
  constructor(
    public readonly approvalId: string,
    public readonly organizationId: string,
    public readonly reason: string,
  ) {}
}
