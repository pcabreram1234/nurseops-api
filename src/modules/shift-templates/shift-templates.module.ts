import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { ShiftTemplatesController } from "./controllers/shift-templates.controller";

import { ShiftTemplatesService } from "./services/shift-templates.service";

import { TemplateEngineService } from "./services/template-engine.service";

import { TemplateValidationService } from "./services/template-validation.service";

import { TemplateGeneratorService } from "./services/template-generator.service";

import { TemplateMatchingService } from "./services/template-matching.service";

import { ShiftTemplateTimeValidator } from "./validators/shift-template-time.validator";

import { ShiftTemplateConfigurationValidator } from "./validators/shift-template-configuration.validator";

import { ShiftTemplateOverlapValidator } from "./validators/shift-template-overlap.validator";

import { ShiftTemplateStaffingValidator } from "./validators/shift-template-staffing.validator";

import { ShiftTemplateListener } from "./listeners/shift-template.listener";

@Module({
  imports: [PrismaModule],

  controllers: [ShiftTemplatesController],

  providers: [
    ShiftTemplatesService,

    TemplateEngineService,

    TemplateValidationService,

    TemplateGeneratorService,

    TemplateMatchingService,

    /*
    |--------------------------------------------------------------------------
    | VALIDATORS
    |--------------------------------------------------------------------------
    */

    ShiftTemplateTimeValidator,

    ShiftTemplateConfigurationValidator,

    ShiftTemplateOverlapValidator,

    ShiftTemplateStaffingValidator,

    /*
    |--------------------------------------------------------------------------
    | LISTENERS
    |--------------------------------------------------------------------------
    */

    ShiftTemplateListener,
  ],

  exports: [ShiftTemplatesService],
})
export class ShiftTemplatesModule {}
