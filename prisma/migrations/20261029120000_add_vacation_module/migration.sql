-- CreateEnum
CREATE TYPE "AbsenceSource" AS ENUM ('VACATION_REQUEST', 'MANUAL');

-- CreateEnum
CREATE TYPE "VacationPolicyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VacationCycleType" AS ENUM ('CALENDAR_YEAR', 'ANNIVERSARY', 'FISCAL_YEAR');

-- CreateEnum
CREATE TYPE "VacationDayBasis" AS ENUM ('CALENDAR_DAYS', 'WORKING_DAYS', 'SCHEDULED_SHIFTS');

-- CreateEnum
CREATE TYPE "VacationTransactionType" AS ENUM ('ACCRUAL', 'ADJUSTMENT', 'CARRY_FORWARD', 'EXPIRATION', 'RESERVATION', 'RESERVATION_RELEASE', 'CONSUMPTION', 'REVERSAL');

-- AlterEnum
ALTER TYPE "AbsenceStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityLogType" ADD VALUE 'SHIFT_MODIFIED';
ALTER TYPE "ActivityLogType" ADD VALUE 'SHIFT_DELETED';
ALTER TYPE "ActivityLogType" ADD VALUE 'ENGINE_EXECUTED';
ALTER TYPE "ActivityLogType" ADD VALUE 'SCHEDULE_PUBLISHED';
ALTER TYPE "ActivityLogType" ADD VALUE 'SCHEDULE_GENERATION_STARTED';
ALTER TYPE "ActivityLogType" ADD VALUE 'SCHEDULE_REGENERATED';
ALTER TYPE "ActivityLogType" ADD VALUE 'ACCRUAL';
ALTER TYPE "ActivityLogType" ADD VALUE 'ADJUSTMENT';
ALTER TYPE "ActivityLogType" ADD VALUE 'CARRY_FORWARD';
ALTER TYPE "ActivityLogType" ADD VALUE 'EXPIRATION';
ALTER TYPE "ActivityLogType" ADD VALUE 'RESERVATION';
ALTER TYPE "ActivityLogType" ADD VALUE 'RESERVATION_RELEASE';
ALTER TYPE "ActivityLogType" ADD VALUE 'CONSUMPTION';
ALTER TYPE "ActivityLogType" ADD VALUE 'REVERSAL';

-- AlterEnum
ALTER TYPE "OperationalAlertyTypes" ADD VALUE 'SYSTEM_WARNING';

-- DropForeignKey
ALTER TABLE "NurseRestriction" DROP CONSTRAINT "NurseRestriction_restrictionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_entries" DROP CONSTRAINT "schedule_entries_requiredSpecialityId_fkey";

-- AlterTable
ALTER TABLE "NurseRestriction" ALTER COLUMN "restrictionTypeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "absences" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "source" "AbsenceSource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "vacationId" TEXT;

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "minimum_staff",
ADD COLUMN     "minimumStaff" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "nurse_profiles" DROP COLUMN "emergencyContact",
DROP COLUMN "health_restrictions",
ADD COLUMN     "emergencyContactName" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "nurse_restrictions_types" DROP COLUMN "nurseRestrictionTypeId";

-- AlterTable
ALTER TABLE "nurses" ADD COLUMN     "isCrossDepartmental" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "specialityId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "operational_alerts" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "organization_settings" DROP COLUMN "allow_cross_department";

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "schedule_entries" DROP COLUMN "requiredSpecialityId",
ADD COLUMN     "shiftTemplateId" TEXT NOT NULL,
ALTER COLUMN "nurseId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "shifts" ADD COLUMN     "shiftTemplateId" TEXT,
DROP COLUMN "durationHours",
ADD COLUMN     "durationHours" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "pushTokens" JSONB;

-- AlterTable
ALTER TABLE "vacations" ADD COLUMN     "absenceDays" INTEGER,
ADD COLUMN     "balanceId" TEXT,
ADD COLUMN     "chargedDays" DECIMAL(6,2),
ADD COLUMN     "payrollDays" DECIMAL(6,2),
ADD COLUMN     "policyId" TEXT,
ADD COLUMN     "policyVersion" INTEGER,
ADD COLUMN     "profileId" TEXT,
ADD COLUMN     "requestedDays" DECIMAL(6,2),
ADD COLUMN     "vacationPolicyId" TEXT;

-- CreateTable
CREATE TABLE "vacation_regimes" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'DO',
    "legalReference" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_regimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_employee_categories" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_employee_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_policies" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT 'DO',
    "regimeCode" TEXT NOT NULL,
    "status" "VacationPolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "cycleType" "VacationCycleType" NOT NULL DEFAULT 'CALENDAR_YEAR',
    "cycleStartMonth" INTEGER NOT NULL DEFAULT 1,
    "cycleStartDay" INTEGER NOT NULL DEFAULT 1,
    "dayBasis" "VacationDayBasis" NOT NULL,
    "carryForwardEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxCarryForwardDays" DECIMAL(6,2),
    "carryForwardExpiryMonths" INTEGER,
    "minNoticeDays" INTEGER NOT NULL DEFAULT 0,
    "allowPartialDays" BOOLEAN NOT NULL DEFAULT false,
    "allowSplitting" BOOLEAN NOT NULL DEFAULT true,
    "maxRequestsPerCycle" INTEGER,
    "reserveOnSubmit" BOOLEAN NOT NULL DEFAULT false,
    "requiresHrApproval" BOOLEAN NOT NULL DEFAULT true,
    "legalReference" TEXT,
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "supersedesPolicyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_policy_rules" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "seniorityFromMonths" INTEGER NOT NULL,
    "seniorityToMonths" INTEGER,
    "daysGranted" DECIMAL(6,2) NOT NULL,
    "accrualMethod" TEXT NOT NULL DEFAULT 'ANNUAL_GRANT',
    "contractTypes" "ContracTypeList"[],
    "employeeCategoryCode" TEXT,
    "minWeeklyHours" DECIMAL(5,2),
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_policy_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_vacation_profiles" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "regimeCode" TEXT NOT NULL,
    "employeeCategoryCode" TEXT,
    "contractType" "ContracTypeList",
    "hireDate" TIMESTAMP(3) NOT NULL,
    "recognizedSeniorityDate" TIMESTAMP(3) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nurse_vacation_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_balances" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "policyVersion" INTEGER NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "accruedDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "carriedInDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "adjustmentDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "usedDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "reservedDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "availableDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "expiredDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "policySnapshot" JSONB NOT NULL,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_transactions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "balanceId" TEXT NOT NULL,
    "vacationId" TEXT,
    "type" "VacationTransactionType" NOT NULL,
    "days" DECIMAL(6,2) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "idempotencyKey" TEXT,
    "balanceAfter" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vacation_regimes_organizationId_code_key" ON "vacation_regimes"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "vacation_employee_categories_organizationId_code_key" ON "vacation_employee_categories"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "vacation_policies_supersedesPolicyId_key" ON "vacation_policies"("supersedesPolicyId");

-- CreateIndex
CREATE INDEX "vacation_policies_organizationId_status_effectiveFrom_idx" ON "vacation_policies"("organizationId", "status", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "vacation_policies_organizationId_code_version_key" ON "vacation_policies"("organizationId", "code", "version");

-- CreateIndex
CREATE INDEX "vacation_policy_rules_policyId_priority_idx" ON "vacation_policy_rules"("policyId", "priority");

-- CreateIndex
CREATE INDEX "nurse_vacation_profiles_organizationId_policyId_isActive_idx" ON "nurse_vacation_profiles"("organizationId", "policyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_vacation_profiles_nurseId_effectiveFrom_key" ON "nurse_vacation_profiles"("nurseId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "vacation_balances_organizationId_periodEnd_idx" ON "vacation_balances"("organizationId", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "vacation_balances_profileId_periodStart_periodEnd_key" ON "vacation_balances"("profileId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "vacation_transactions_idempotencyKey_key" ON "vacation_transactions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "vacation_transactions_balanceId_effectiveDate_idx" ON "vacation_transactions"("balanceId", "effectiveDate");

-- CreateIndex
CREATE INDEX "vacation_transactions_vacationId_idx" ON "vacation_transactions"("vacationId");

-- CreateIndex
CREATE UNIQUE INDEX "NurseRestriction_nurseId_restrictionTypeId_key" ON "NurseRestriction"("nurseId", "restrictionTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "absences_vacationId_key" ON "absences"("vacationId");

-- CreateIndex
CREATE UNIQUE INDEX "nurses_userId_key" ON "nurses"("userId");

-- AddForeignKey
ALTER TABLE "schedule_entries" ADD CONSTRAINT "schedule_entries_shiftTemplateId_fkey" FOREIGN KEY ("shiftTemplateId") REFERENCES "shift_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_vacationId_fkey" FOREIGN KEY ("vacationId") REFERENCES "vacations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_regimes" ADD CONSTRAINT "vacation_regimes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_employee_categories" ADD CONSTRAINT "vacation_employee_categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_policies" ADD CONSTRAINT "vacation_policies_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_policies" ADD CONSTRAINT "vacation_policies_supersedesPolicyId_fkey" FOREIGN KEY ("supersedesPolicyId") REFERENCES "vacation_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_policy_rules" ADD CONSTRAINT "vacation_policy_rules_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "vacation_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_vacation_profiles" ADD CONSTRAINT "nurse_vacation_profiles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_vacation_profiles" ADD CONSTRAINT "nurse_vacation_profiles_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_vacation_profiles" ADD CONSTRAINT "nurse_vacation_profiles_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "vacation_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_balances" ADD CONSTRAINT "vacation_balances_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_balances" ADD CONSTRAINT "vacation_balances_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nurse_vacation_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_transactions" ADD CONSTRAINT "vacation_transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_transactions" ADD CONSTRAINT "vacation_transactions_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "vacation_balances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_transactions" ADD CONSTRAINT "vacation_transactions_vacationId_fkey" FOREIGN KEY ("vacationId") REFERENCES "vacations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacations" ADD CONSTRAINT "vacations_vacationPolicyId_fkey" FOREIGN KEY ("vacationPolicyId") REFERENCES "vacation_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseRestriction" ADD CONSTRAINT "NurseRestriction_restrictionTypeId_fkey" FOREIGN KEY ("restrictionTypeId") REFERENCES "nurse_restrictions_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_shiftTemplateId_fkey" FOREIGN KEY ("shiftTemplateId") REFERENCES "shift_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

