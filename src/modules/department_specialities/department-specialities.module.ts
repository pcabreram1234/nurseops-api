import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { DepartmentSpecialitiesController } from "./controllers/department-specialities.controller";

import { DepartmentSpecialitiesService } from "./services/department-specialities.service";

import { DepartmentSpecialityMatchingService } from "./services/department-speciality-matching.service";

import { DepartmentSpecialityValidationService } from "./services/department-speciality-validation.service";

import { SpecialityCoverageService } from "./services/speciality-coverage.service";

import { SpecialityRequiredValidator } from "./validators/speciality-required.validator";

import { DepartmentSpecialityValidator } from "./validators/department-speciality.validator";

import { SpecialityCoverageValidator } from "./validators/speciality-coverage.validator";

import { DepartmentSpecialityListener } from "./listeners/department-speciality.listener";

@Module({
  imports: [PrismaModule],

  controllers: [DepartmentSpecialitiesController],

  providers: [
    DepartmentSpecialitiesService,

    DepartmentSpecialityMatchingService,

    DepartmentSpecialityValidationService,

    SpecialityCoverageService,

    /*
    |--------------------------------------------------------------------------
    | VALIDATORS
    |--------------------------------------------------------------------------
    */

    SpecialityRequiredValidator,

    DepartmentSpecialityValidator,

    SpecialityCoverageValidator,

    /*
    |--------------------------------------------------------------------------
    | LISTENERS
    |--------------------------------------------------------------------------
    */

    DepartmentSpecialityListener,
  ],

  exports: [DepartmentSpecialitiesService],
})
export class DepartmentSpecialitiesModule {}
