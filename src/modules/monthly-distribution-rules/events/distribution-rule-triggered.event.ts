export class DistributionRuleTriggeredEvent {
  constructor(
    public readonly ruleType: string,

    public readonly departmentId: string,

    public readonly message: string,
  ) {}
}
