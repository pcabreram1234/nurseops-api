import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { AbsencesController } from "./controllers/absences.controller";

import { AbsencesService } from "./services/absences.service";

@Module({
  imports: [PrismaModule],

  controllers: [AbsencesController],

  providers: [AbsencesService],

  exports: [AbsencesService],
})
export class AbsencesModule {}
