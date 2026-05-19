import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { ShiftsController } from "./controllers/shifts.controller";

import { ShiftsService } from "./services/shifts.service";

@Module({
  imports: [PrismaModule],

  controllers: [ShiftsController],

  providers: [ShiftsService],

  exports: [ShiftsService],
})
export class ShiftsModule {}
