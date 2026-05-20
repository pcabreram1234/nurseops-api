export class WorkRuleTriggeredEvent {
  constructor(
    public readonly ruleCode: string,

    public readonly nurseId: string,

    public readonly scheduleId: string,

    public readonly message: string,

    public readonly severity: string,
  ) {}
}
