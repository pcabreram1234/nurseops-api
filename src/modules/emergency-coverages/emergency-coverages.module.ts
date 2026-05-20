import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { EmergencyCoveragesController } from "./controllers/emergency-coverages.controller";

import { EmergencyCoveragesService } from "./services/emergency-coverages.service";

import { EmergencyMatchingService } from "./services/emergency-matching.service";

import { EmergencyRankingService } from "./services/emergency-ranking.service";

import { EmergencyAIService } from "./services/emergency-ai.service";

import { EmergencyAssignmentService } from "./services/emergency-assignment.service";
import { EmergencyAlertService } from "./services/emergency-alert.service";

import { EmergencyFatigueValidator } from "./validator/emergency-fatigue.validator";
import { EmergencyAvailabilityValidator } from "./validator/emergency-availability.validator";
import { EmergencyOvertimeValidator } from "./validator/emergency-overtime.validator";
import { EmergencyCompatibilityValidator } from "./validator/emergency-compatibility.validator";
import { EmergencyLicenseValidator } from "./validator/emergency-license.validator";
import { EmergencyDepartmentValidator } from "./validator/emergency-department.validator";

import { EmergencyEscalationListener } from "./listeners/emergency-escalation.listener";
import { EmergencyListener } from "./listeners/emergency.listener";
import { EmergencyNotificationListener } from "./listeners/emergency-notification.listener";

import { EmergencyMatchingJob } from "./jobs/emergency-matching.job";
import { EmergencyReassignmentJob } from "./jobs/emergency-reassignment.job";
import { EmergencyExpirationJob } from "./jobs/emergency-expiration.job";

import { EmergencyCoveragesGateway } from "./gateways/emergency-coverages.gateway";

@Module({
  imports: [PrismaModule],

  controllers: [EmergencyCoveragesController],

  providers: [
    EmergencyCoveragesService,

    EmergencyMatchingService,

    EmergencyRankingService,

    EmergencyAIService,

    EmergencyAssignmentService,

    EmergencyAlertService,

    /*
  |--------------------------------------------------------------------------
  | VALIDATORS
  |--------------------------------------------------------------------------
  */

    EmergencyFatigueValidator,

    EmergencyOvertimeValidator,

    EmergencyAvailabilityValidator,

    EmergencyCompatibilityValidator,

    EmergencyLicenseValidator,

    EmergencyDepartmentValidator,

    /*
  |--------------------------------------------------------------------------
  | LISTENERS
  |--------------------------------------------------------------------------
  */

    EmergencyListener,

    EmergencyNotificationListener,

    EmergencyEscalationListener,

    /*
  |--------------------------------------------------------------------------
  | JOBS
  |--------------------------------------------------------------------------
  */

    EmergencyMatchingJob,

    EmergencyReassignmentJob,

    EmergencyExpirationJob,

    /*
  |--------------------------------------------------------------------------
  | GATEWAYS
  |--------------------------------------------------------------------------
  */

    EmergencyCoveragesGateway,
  ],

  exports: [EmergencyCoveragesService],
})
export class EmergencyCoveragesModule {}
