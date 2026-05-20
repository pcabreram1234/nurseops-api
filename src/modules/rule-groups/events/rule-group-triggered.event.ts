export class RuleGroupTriggeredEvent {
  constructor(
    public readonly ruleGroupId: string,

    public readonly message: string,
  ) {}
}
