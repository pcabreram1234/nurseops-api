import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { ShiftChangeRequestsController } from "@modules/shift-change-requests/controllers/shift-change-requests.controller";

import { ShiftChangeRequestsService } from "@modules/shift-change-requests/services/shift-change-requests.service";

import { ShiftChangeEngineService } from "@modules/shift-change-requests/services/shift-change-engine.service";

import { ShiftChangeGateway } from "@modules/shift-change-requests/gateways/shift-change.gateway";

@Module({
  imports: [PrismaModule],

  controllers: [ShiftChangeRequestsController],

  providers: [
    ShiftChangeRequestsService,

    ShiftChangeEngineService,

    ShiftChangeGateway,
  ],

  exports: [ShiftChangeRequestsService],
})
export class ShiftChangeRequestsModule {}
