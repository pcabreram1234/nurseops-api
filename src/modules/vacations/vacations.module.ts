import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { VacationPoliciesModule } from "../vacation-policies/vacation-policies.module";

import { VacationsService } from "./services/vacations.service";

import { VacationsController } from "./controllers/vacations.controller";

@Module({
  imports: [PrismaModule, VacationPoliciesModule],

  controllers: [VacationsController],

  providers: [VacationsService],

  exports: [VacationsService],
})
export class VacationsModule {}
