import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { NurseAvailabilityController } from "./controllers/nurse-availability.controller";

import { NurseAvailabilityService } from "./services/nurse-availability.service";

@Module({
  imports: [PrismaModule],

  controllers: [NurseAvailabilityController],

  providers: [NurseAvailabilityService],

  exports: [NurseAvailabilityService],
})
export class NurseAvailabilityModule {}
