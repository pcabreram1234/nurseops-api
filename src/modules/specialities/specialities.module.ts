import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { SpecialitiesController } from "./controllers/specialities.controller";

import { SpecialitiesService } from "./services/specialities.service";

import { SpecialityMatchingService } from "./services/speciality-matching.service";

import { SpecialityValidationService } from "./services/speciality-validation.service";

import { SpecialityRankingService } from "./services/speciality-ranking.service";

import { SpecialityActiveValidator } from "./validators/speciality-active.validator";

import { SpecialityCompatibilityValidator } from "./validators/speciality-compatibility.validator";

import { SpecialityCertificationValidator } from "./validators/speciality-certification.validator";

import { SpecialityListener } from "./listeners/speciality.listener";

@Module({
  imports: [PrismaModule],

  controllers: [SpecialitiesController],

  providers: [
    SpecialitiesService,

    SpecialityMatchingService,

    SpecialityValidationService,

    SpecialityRankingService,

    /*
    |--------------------------------------------------------------------------
    | VALIDATORS
    |--------------------------------------------------------------------------
    */

    SpecialityActiveValidator,

    SpecialityCompatibilityValidator,

    SpecialityCertificationValidator,

    /*
    |--------------------------------------------------------------------------
    | LISTENERS
    |--------------------------------------------------------------------------
    */

    SpecialityListener,
  ],

  exports: [SpecialitiesService],
})
export class SpecialitiesModule {}
