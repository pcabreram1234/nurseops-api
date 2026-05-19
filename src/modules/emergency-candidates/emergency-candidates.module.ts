import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { EmergencyCandidatesController } from "./controller/emergency-candidates.controller";

import { EmergencyCandidatesService } from "./services/emergency-candidates.service";

@Module({
  imports: [PrismaModule],

  controllers: [EmergencyCandidatesController],

  providers: [EmergencyCandidatesService],

  exports: [EmergencyCandidatesService],
})
export class EmergencyCandidatesModule {}
