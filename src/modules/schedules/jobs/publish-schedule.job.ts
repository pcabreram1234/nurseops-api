export class PublishScheduleJob {
  constructor(
    public readonly scheduleId: string,

    public readonly organizationId: string,

    public readonly publishedById: string,

    public readonly notifyStaff: boolean,
  ) {}
}
