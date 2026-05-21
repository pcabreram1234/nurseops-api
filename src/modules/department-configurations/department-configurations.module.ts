import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { DepartmentConfigurationsController } from "./controllers/department-configurations.controller";

import { DepartmentConfigurationsService } from "./services/department-configurations.service";

import { StaffingRulesService } from "./services/staffing-rules.service";

import { CoveragePolicyService } from "./services/coverage-policy.service";

import { DepartmentPolicyEngineService } from "./services/department-policy-engine.service";

import { MinimumStaffValidator } from "./validators/minimum-staff.validator";

import { DoubleShiftValidator } from "./validators/double-shift.validator";

import { ExternalSupportValidator } from "./validators/external-support.validator";

import { NightLimitValidator } from "./validators/night-limit.validator";

import { DepartmentConfigurationListener } from "./listeners/department-configuration.listener";

@Module({
  imports: [PrismaModule],

  controllers: [DepartmentConfigurationsController],

  providers: [
    DepartmentConfigurationsService,

    StaffingRulesService,

    CoveragePolicyService,

    DepartmentPolicyEngineService,

    /*
    |--------------------------------------------------------------------------
    | VALIDATORS
    |--------------------------------------------------------------------------
    */

    MinimumStaffValidator,

    DoubleShiftValidator,

    ExternalSupportValidator,

    NightLimitValidator,

    /*
    |--------------------------------------------------------------------------
    | LISTENERS
    |--------------------------------------------------------------------------
    */

    DepartmentConfigurationListener,
  ],

  exports: [DepartmentConfigurationsService],
})
export class DepartmentConfigurationsModule {}
