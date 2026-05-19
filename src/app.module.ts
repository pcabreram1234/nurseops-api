import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PrismaModule } from "@infra/database/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { OrganizationModule } from "@modules/organizations/organizations.module";
import { RolesModule } from "@modules/roles/roles.module";
import { UsersModule } from "@modules/users/users.module";
import { NursesModule } from "@modules/nurses/nurses.module";
import { EmergencyCandidatesModule } from "@modules/emergency-candidates/emergency-candidates.module";
import { NursePreferencesModule } from "@modules/nurse-preferences/nurse-preferences.module";
import { OptimizationScoresModule } from "@modules/optimization-scores/optimization-scores.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationModule,
    RolesModule,
    NursesModule,
    EmergencyCandidatesModule,
    NursePreferencesModule,
    OptimizationScoresModule,
  ],
})
export class AppModule {}
