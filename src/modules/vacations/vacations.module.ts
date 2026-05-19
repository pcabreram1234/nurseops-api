import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { VacationsController } from "./controllers/vacations.controller";

import { VacationsService } from "./services/vacations.service";

@Module({
  imports: [PrismaModule],

  controllers: [VacationsController],

  providers: [VacationsService],

  exports: [VacationsService],
})
export class VacationsModule {}
