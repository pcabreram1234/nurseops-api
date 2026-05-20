export class NotificationSentEvent {
  constructor(
    public readonly notificationId: string,

    public readonly recipients: string[],

    public readonly channels: string[],
  ) {}
}
