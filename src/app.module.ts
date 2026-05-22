import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";

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
import { VacationsModule } from "@modules/vacations/vacations.module";
import { BranchesModule } from "@modules/branches/branches.module";
import { DepartmentsModule } from "@modules/departments/departments.module";
import { NotificationsModule } from "@modules/notifications/notifications.module";
import { SchedulesModule } from "@modules/schedules/schedules.module";
import { WorkRulesModule } from "@modules/work-rules/work-rules.module";
import { RuleGroupsModule } from "@modules/rule-groups/rule-groups.module";
import { EmergencyCoveragesModule } from "@modules/emergency-coverages/emergency-coverages.module";
import { ScheduleVersionsModule } from "@modules/schedule-versions/schedule-versions.module";
import { ShiftTemplatesModule } from "@modules/shift-templates/shift-templates.module";
import { SpecialitiesModule } from "@modules/specialities/specialities.module";
import { DepartmentConfigurationsModule } from "@modules/department-configurations/department-configurations.module";
import { DepartmentSpecialitiesModule } from "@modules/department_specialities/department-specialities.module";
import { ShiftChangeApprovalsModule } from "@modules/shift-change-approvals/shift-change-approvals.module";
import { ShiftChangeRequestsModule } from "@modules/shift-change-requests/shift-change-requests.module";
import { ShiftChangeDocumentsModule } from "@modules/shift-change-documents/shift-change-documents.module";
import { NotificationTypesModule } from "@modules/notification-types/notification-types.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      }
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
    VacationsModule,
    BranchesModule,
    DepartmentsModule,
    NotificationsModule,
    SchedulesModule,
    WorkRulesModule,
    RuleGroupsModule,
    EmergencyCoveragesModule,
    ScheduleVersionsModule,
    ShiftTemplatesModule,
    SpecialitiesModule,
    DepartmentConfigurationsModule,
    DepartmentSpecialitiesModule,
    ShiftChangeApprovalsModule,
    ShiftChangeRequestsModule,
    ShiftChangeDocumentsModule,
    NotificationTypesModule
  ],
})
export class AppModule { }
