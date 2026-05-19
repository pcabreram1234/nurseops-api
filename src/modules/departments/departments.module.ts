import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { DepartmentsController } from "./controllers/departments.controller";

import { DepartmentsService } from "./services/departments.service";

@Module({
  imports: [PrismaModule],

  controllers: [DepartmentsController],

  providers: [DepartmentsService],

  exports: [DepartmentsService],
})
export class DepartmentsModule {}
