import { Module } from "@nestjs/common";
import { PrismaModule } from "@infra/database/prisma.module";
import { ShiftChangePoliciesController } from "./shift-change-policies.controller";
import { ShiftChangePoliciesService } from "./shift-change-policies.service";

@Module({
  imports: [PrismaModule],
  controllers: [ShiftChangePoliciesController],
  providers: [ShiftChangePoliciesService],
  exports: [ShiftChangePoliciesService],
})
export class ShiftChangePoliciesModule {}
