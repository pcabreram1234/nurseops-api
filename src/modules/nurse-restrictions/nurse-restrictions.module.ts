import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { NurseRestrictionsController } from "./controllers/nurse-restrictions.controller";

import { RestrictionTypesController } from "./controllers/restriction-types.controller";

import { NurseRestrictionsService } from "./services/nurse-restrictions.service";

import { RestrictionTypesService } from "./services/restriction-types.service";

@Module({
  imports: [PrismaModule],

  controllers: [NurseRestrictionsController, RestrictionTypesController],

  providers: [NurseRestrictionsService, RestrictionTypesService],

  exports: [NurseRestrictionsService, RestrictionTypesService],
})
export class NurseRestrictionsModule {}
