import { Injectable, OnModuleInit } from "@nestjs/common";

import { EventEmitter2 } from "@nestjs/event-emitter";

import { WorkRuleRegistryService } from "./work-rule-registry.service";

import { MaxHoursValidator } from "../validators/max-hours.validator";

import { NightShiftsValidator } from "../validators/night-shifts.validator";

import { ConsecutiveDaysValidator } from "../validators/consecutive-days.validator";

@Injectable()
export class WorkRuleEngineService implements OnModuleInit {
  constructor(
    private readonly registry: WorkRuleRegistryService,

    private readonly eventEmitter: EventEmitter2,

    /*
    |--------------------------------------------------------------------------
    | VALIDATORS
    |--------------------------------------------------------------------------
    */
    private readonly maxHoursValidator: MaxHoursValidator,
    private readonly nightShiftsValidator: NightShiftsValidator,
    private readonly consecutiveDaysValidator: ConsecutiveDaysValidator,
  ) {}

  /*
  |--------------------------------------------------------------------------
  | REGISTER VALIDATORS
  |--------------------------------------------------------------------------
  */

  onModuleInit() {
    this.registry.register(this.maxHoursValidator);
    this.registry.register(this.nightShiftsValidator);
    this.registry.register(this.consecutiveDaysValidator);
  }

  /*
  |--------------------------------------------------------------------------
  | EVALUATE RULE
  |--------------------------------------------------------------------------
  */

  async evaluateRule(rule: any, payload: any) {
    const validator = this.registry.getValidator(rule.code);

    /*
    |--------------------------------------------------------------------------
    | NO VALIDATOR FOUND
    |--------------------------------------------------------------------------
    */

    if (!validator) {
      return {
        valid: true,
        skipped: true,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | EXECUTE VALIDATOR
    |--------------------------------------------------------------------------
    */

    const result = await validator.validate(rule, payload);

    /*
    |--------------------------------------------------------------------------
    | EMIT EVENT
    |--------------------------------------------------------------------------
    */

    if (!result.valid) {
      this.eventEmitter.emit("work-rule.triggered", {
        ruleCode: rule.code,
        nurseId: payload.nurseId,
        scheduleId: payload.scheduleId,
        message: result.message,
      });
    }

    return result;
  }
}
