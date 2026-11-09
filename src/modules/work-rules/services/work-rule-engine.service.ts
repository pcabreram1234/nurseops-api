import { Injectable, OnModuleInit } from "@nestjs/common";

import { EventEmitter2 } from "@nestjs/event-emitter";

import { WorkRuleRegistryService } from "./work-rule-registry.service";

import { MaxHoursValidator } from "../validators/max-hours.validator";

import { NightShiftsValidator } from "../validators/night-shifts.validator";

import { ConsecutiveDaysValidator } from "../validators/consecutive-days.validator";

import { RestBetweenShiftsValidator } from "../validators/rest-between-shifts.validator";

import { SpecialtyValidator } from "../validators/specialty.validator";

import { DepartmentCoverageValidator } from "../validators/department-coverage.validator";

import { AvailabilityValidator } from "../validators/availability.validator";

import { WorkRuleResult } from "../interfaces/work-rule-result.interface";

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

    private readonly restBetweenShiftsValidator: RestBetweenShiftsValidator,

    private readonly specialtyValidator: SpecialtyValidator,

    private readonly departmentCoverageValidator: DepartmentCoverageValidator,

    private readonly availabilityValidator: AvailabilityValidator,
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
    this.registry.register(this.restBetweenShiftsValidator);
    this.registry.register(this.specialtyValidator);
    this.registry.register(this.departmentCoverageValidator);
    this.registry.register(this.availabilityValidator);
  }

  /*
  |--------------------------------------------------------------------------
  | EVALUATE RULE
  |--------------------------------------------------------------------------
  */

  async evaluateRule(rule: any, payload: any): Promise<WorkRuleResult> {
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
    | GUARD: asegurarse de que validate es una función invocable
    |--------------------------------------------------------------------------
    */

    if (typeof validator.validate !== 'function') {
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
        severity: result.severity,
      });
    }

    return result;
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE (BATCH)
  |--------------------------------------------------------------------------
  | Evalúa un conjunto de reglas activas para un contexto dado y devuelve
  | los bloques HARD y advertencias SOFT de forma centralizada.
  |--------------------------------------------------------------------------
  */

  async validate(
    rules: any[],
    payload: any,
  ): Promise<{
    valid: boolean;
    hardBlocks: WorkRuleResult[];
    softWarnings: WorkRuleResult[];
    results: WorkRuleResult[];
  }> {
    const hardBlocks: WorkRuleResult[] = [];
    const softWarnings: WorkRuleResult[] = [];
    const results: WorkRuleResult[] = [];

    for (const rule of rules) {
      const result = (await this.evaluateRule(rule, payload)) as WorkRuleResult;
      results.push(result);

      if (!result.valid && !result.skipped) {
        const severity = (rule.type || "SOFT") as "HARD" | "SOFT";
        if (severity === "HARD") {
          hardBlocks.push(result);
        } else {
          softWarnings.push(result);
        }
      }
    }

    return {
      valid: hardBlocks.length === 0,
      hardBlocks,
      softWarnings,
      results,
    };
  }
}
