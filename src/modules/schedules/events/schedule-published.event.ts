export class SchedulePublishedEvent {
  constructor(
    public readonly scheduleId: string,

    public readonly organizationId: string,

    public readonly publishedById: string,

    public readonly publishedAt: Date,

    public readonly notifyStaff: boolean,
  ) {}
}
