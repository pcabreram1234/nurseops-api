import { Module } from "@nestjs/common";

import { NursesController } from "./controllers/nurses.controller";

import { NursesService } from "./services/nurses.service";

import { PrismaModule } from "@infra/database/prisma.module";

@Module({
  imports: [PrismaModule],

  controllers: [NursesController],

  providers: [NursesService],

  exports: [NursesService],
})
export class NursesModule {}
