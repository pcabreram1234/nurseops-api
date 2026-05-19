import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { NursePreferencesController } from "./controllers/nurse-preferences.controller";

import { NursePreferencesService } from "./services/nurse-preferences.service";

@Module({
  imports: [PrismaModule],

  controllers: [NursePreferencesController],

  providers: [NursePreferencesService],

  exports: [NursePreferencesService],
})
export class NursePreferencesModule {}
