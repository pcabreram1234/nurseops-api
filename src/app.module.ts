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
import { ScheduleEntriesModule } from "@modules/schedule-entries/schedule-entries.module";
import { AbsencesModule } from "@modules/absences/absences.module";
import { LeavesModule } from "@modules/leaves/leaves.module";
import { WorkloadMetricsModule } from "@modules/workload-metrics/workload-metrics.module";
import { NurseProfilesModule } from "@modules/nurse-profiles/nurse-profiles.module";
import { NurseRestrictionsModule } from "@modules/nurse-restrictions/nurse-restrictions.module";

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
    ScheduleEntriesModule,
    AbsencesModule,
    LeavesModule,
    WorkloadMetricsModule,
    NurseProfilesModule,
    NurseRestrictionsModule,
  ],
})
export class AppModule {}
