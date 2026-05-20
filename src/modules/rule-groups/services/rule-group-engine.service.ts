import { Injectable } from "@nestjs/common";

import { WorkRuleEngineService } from "@modules/work-rules/services/work-rule-engine.service";

@Injectable()
export class RuleGroupEngineService {
  constructor(private readonly workRuleEngine: WorkRuleEngineService) {}

  async evaluateGroup(ruleGroup: any, payload: any) {
    const results: { rule: any; result: any }[] = [];
    let failedRules = 0;

    /*
    |--------------------------------------------------------------------------
    | SORT BY PRIORITY
    |--------------------------------------------------------------------------
    */

    const assignments = ruleGroup.assignments.sort(
      (a: any, b: any) => a.priority - b.priority,
    );

    /*
    |--------------------------------------------------------------------------
    | EVALUATE
    |--------------------------------------------------------------------------
    */

    for (const assignment of assignments) {
      const result = await this.workRuleEngine.evaluateRule(
        assignment.workRule,
        payload,
      );

      results.push({
        rule: assignment.workRule.code,
        result,
      });

      if (!result.valid) {
        failedRules++;
      }
    }

    return {
      valid: failedRules === 0,
      totalRules: assignments.length,
      failedRules,
      results,
    };
  }
}
