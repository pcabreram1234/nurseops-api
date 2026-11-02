import { Module } from "@nestjs/common";

import { ScheduleModule } from "@nestjs/schedule";

import { PrismaModule } from "@infra/database/prisma.module";

import { VacationPolicyService } from "./services/vacation-policy.service";

import { VacationBalanceService } from "./services/vacation-balance.service";

import { VacationPolicyController } from "./controllers/vacation-policy.controller";

import { VacationReportsController } from "./controllers/vacation-reports.controller";

import { VacationReportsService } from "./services/vacation-reports.service";

import { VacationAccrualJob } from "./jobs/vacation-accrual.job";

import { VacationExpirationJob } from "./jobs/vacation-expiration.job";

import { VacationCycleCloseJob } from "./jobs/vacation-cycle-close.job";

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],

  controllers: [VacationPolicyController, VacationReportsController],

  providers: [
    VacationPolicyService,
    VacationBalanceService,
    VacationReportsService,
    VacationAccrualJob,
    VacationExpirationJob,
    VacationCycleCloseJob,
  ],

  exports: [VacationPolicyService, VacationBalanceService, VacationReportsService],
})
export class VacationPoliciesModule {}
