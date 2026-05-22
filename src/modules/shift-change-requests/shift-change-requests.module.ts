import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { ShiftChangeRequestsController } from "@modules/shift-change-requests/controllers/shift-change-requests.controller";

import { ShiftChangeRequestsService } from "@modules/shift-change-requests/services/shift-change-requests.service";

import { ShiftChangeEngineService } from "@modules/shift-change-requests/services/shift-change-engine.service";

import { ShiftChangeGateway } from "@modules/shift-change-requests/gateways/shift-change.gateway";

import { ShiftChangeValidatorService } from "./services/shift-change-validator.service";

import { ShiftChangeRiskService } from "./services/shift-change-risk.service";

import { ShiftChangeAIService } from "./services/shift-change-ai.service";

import { ShiftChangeAuditService } from "./services/shift-change-audit.service";

import { ShiftChangeNotificationService } from "./services/shift-change-notification.service";

import { ShiftCompatibilityValidator } from "./validators/shift-compatibility.validator";

import { OvertimeValidator } from "./validators/overtime.validator";

import { NurseAvailabilityValidator } from "./validators/nurse-availability.validator";

@Module({
  imports: [PrismaModule],

  controllers: [ShiftChangeRequestsController],

  providers: [
    ShiftChangeRequestsService,

    ShiftChangeEngineService,

    ShiftChangeGateway,

    ShiftChangeValidatorService,

    ShiftChangeRiskService,

    ShiftChangeAIService,

    ShiftChangeAuditService,

    ShiftChangeNotificationService,

    ShiftCompatibilityValidator,

    OvertimeValidator,

    NurseAvailabilityValidator,
  ],

  exports: [ShiftChangeRequestsService],
})
export class ShiftChangeRequestsModule {}
