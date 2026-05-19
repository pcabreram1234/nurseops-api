import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { NurseProfilesController } from "./controllers/nurse-profiles.controller";

import { NurseProfilesService } from "./services/nurse-profiles.service";

@Module({
  imports: [PrismaModule],

  controllers: [NurseProfilesController],

  providers: [NurseProfilesService],

  exports: [NurseProfilesService],
})
export class NurseProfilesModule {}
