import { Injectable, OnModuleInit } from "@nestjs/common";

import { EventEmitter2 } from "@nestjs/event-emitter";

import { DistributionRegistryService } from "./distribution-registry.service";

import { BalanceNightsValidator } from "../validators/balance-nights.validator";

import { BalanceWeekendsValidator } from "../validators/balance-weekends.validator";

import { OvertimeDistributionValidator } from "../validators/overtime-distribution.validator";

@Injectable()
export class DistributionEngineService implements OnModuleInit {
  constructor(
    private readonly registry: DistributionRegistryService,

    private readonly eventEmitter: EventEmitter2,

    /*
    |--------------------------------------------------------------------------
    | VALIDATORS
    |--------------------------------------------------------------------------
    */

    private readonly balanceNightsValidator: BalanceNightsValidator,

    private readonly balanceWeekendsValidator: BalanceWeekendsValidator,

    private readonly overtimeDistributionValidator: OvertimeDistributionValidator,
  ) {}

  /*
  |--------------------------------------------------------------------------
  | REGISTER VALIDATORS
  |--------------------------------------------------------------------------
  */

  onModuleInit() {
    this.registry.register(this.balanceNightsValidator);

    this.registry.register(this.balanceWeekendsValidator);

    this.registry.register(this.overtimeDistributionValidator);
  }

  /*
  |--------------------------------------------------------------------------
  | EVALUATE RULE
  |--------------------------------------------------------------------------
  */

  async evaluateRule(rule: any, payload: any) {
    /*
    |--------------------------------------------------------------------------
    | GET VALIDATOR
    |--------------------------------------------------------------------------
    */

    const validator = this.registry.getValidator(rule.rule_type);

    /*
    |--------------------------------------------------------------------------
    | VALIDATOR NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!validator) {
      return {
        valid: true,
        skipped: true,
        message: "Validator not found",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | EXECUTE VALIDATION
    |--------------------------------------------------------------------------
    */

    const result = await validator.validate(rule, payload);

    /*
    |--------------------------------------------------------------------------
    | EMIT EVENT
    |--------------------------------------------------------------------------
    */

    if (!result.valid) {
      this.eventEmitter.emit("distribution-rule.triggered", {
        ruleType: rule.type,

        organizationId: payload.organizationId,

        departmentId: payload.departmentId,

        message: result.message,

        severity: result.severity,

        metadata: result.metadata,
      });
    }

    return result;
  }

  /*
  |--------------------------------------------------------------------------
  | EVALUATE MULTIPLE RULES
  |--------------------------------------------------------------------------
  */

  async evaluateRules(rules: any[], payload: any) {
    const results: { ruleType: any; result: any }[] = [];

    for (const rule of rules) {
      const result = await this.evaluateRule(rule, payload);

      results.push({
        ruleType: rule.type,
        result,
      });
    }

    return results;
  }
}
