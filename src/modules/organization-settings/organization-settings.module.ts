import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { OrganizationSettingsController } from "./controllers/organization-settings.controller";

import { OrganizationSettingsService } from "./services/organization-settings.service";

@Module({
  imports: [PrismaModule],

  controllers: [OrganizationSettingsController],

  providers: [OrganizationSettingsService],

  exports: [OrganizationSettingsService],
})
export class OrganizationSettingsModule {}
