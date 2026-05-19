import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { LeavesController } from "./controllers/leaves.controller";

import { LeavesService } from "./services/leaves.service";

@Module({
  imports: [PrismaModule],

  controllers: [LeavesController],

  providers: [LeavesService],

  exports: [LeavesService],
})
export class LeavesModule {}
