import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { BranchesController } from "./controllers/branches.controller";

import { BranchesService } from "./services/branches.service";

@Module({
  imports: [PrismaModule],

  controllers: [BranchesController],

  providers: [BranchesService],

  exports: [BranchesService],
})
export class BranchesModule {}
