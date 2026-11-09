-- CreateEnum
CREATE TYPE "ShiftChangeOperationType" AS ENUM ('SWAP', 'TRANSFER', 'COVERAGE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'SELECTED', 'REJECTED', 'WITHDRAWN');

-- AlterEnum: add PUBLISHED to RequestStatus
ALTER TYPE "RequestStatus" ADD VALUE 'PUBLISHED';

-- AlterTable: add new columns to shift_change_requests
ALTER TABLE "shift_change_requests" ADD COLUMN     "operationType" "ShiftChangeOperationType" NOT NULL DEFAULT 'SWAP';
ALTER TABLE "shift_change_requests" ADD COLUMN     "sourceScheduleEntryId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "shift_change_requests" ADD COLUMN     "targetScheduleEntryId" TEXT;

-- CreateTable
CREATE TABLE "shift_change_responses" (
    "id" TEXT NOT NULL,
    "shiftChangeRequestId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "decision" "ChangeApprovalsTypes" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_change_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_change_applications" (
    "id" TEXT NOT NULL,
    "shiftChangeRequestId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selectedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_change_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_change_policies" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "departmentId" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "allowSwap" BOOLEAN NOT NULL DEFAULT true,
    "allowTransfer" BOOLEAN NOT NULL DEFAULT true,
    "allowCoverage" BOOLEAN NOT NULL DEFAULT true,
    "allowCrossDepartment" BOOLEAN NOT NULL DEFAULT false,
    "allowCrossBranch" BOOLEAN NOT NULL DEFAULT false,
    "requireJustification" BOOLEAN NOT NULL DEFAULT true,
    "requireDocument" BOOLEAN NOT NULL DEFAULT false,
    "requireSupervisorApproval" BOOLEAN NOT NULL DEFAULT true,
    "requireHrApproval" BOOLEAN NOT NULL DEFAULT false,
    "minAdvanceHours" INTEGER NOT NULL DEFAULT 24,
    "maxAdvanceDays" INTEGER NOT NULL DEFAULT 90,
    "autoExpireHours" INTEGER NOT NULL DEFAULT 48,
    "maxSimultaneousRequests" INTEGER NOT NULL DEFAULT 3,
    "allowMultipleApplications" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_change_policies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shift_change_requests" ADD CONSTRAINT "shift_change_requests_sourceScheduleEntryId_fkey" FOREIGN KEY ("sourceScheduleEntryId") REFERENCES "schedule_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shift_change_requests" ADD CONSTRAINT "shift_change_requests_targetScheduleEntryId_fkey" FOREIGN KEY ("targetScheduleEntryId") REFERENCES "schedule_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_responses" ADD CONSTRAINT "shift_change_responses_shiftChangeRequestId_fkey" FOREIGN KEY ("shiftChangeRequestId") REFERENCES "shift_change_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shift_change_responses" ADD CONSTRAINT "shift_change_responses_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_applications" ADD CONSTRAINT "shift_change_applications_shiftChangeRequestId_fkey" FOREIGN KEY ("shiftChangeRequestId") REFERENCES "shift_change_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shift_change_applications" ADD CONSTRAINT "shift_change_applications_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_policies" ADD CONSTRAINT "shift_change_policies_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shift_change_policies" ADD CONSTRAINT "shift_change_policies_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "shift_change_policies" ADD CONSTRAINT "shift_change_policies_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "shift_change_requests_operationType_idx" ON "shift_change_requests"("operationType");

CREATE INDEX "shift_change_requests_sourceScheduleEntryId_idx" ON "shift_change_requests"("sourceScheduleEntryId");

CREATE INDEX "shift_change_requests_targetScheduleEntryId_idx" ON "shift_change_requests"("targetScheduleEntryId");

CREATE INDEX "shift_change_responses_nurseId_idx" ON "shift_change_responses"("nurseId");

CREATE INDEX "shift_change_responses_shiftChangeRequestId_idx" ON "shift_change_responses"("shiftChangeRequestId");

CREATE INDEX "shift_change_applications_nurseId_idx" ON "shift_change_applications"("nurseId");

CREATE INDEX "shift_change_applications_shiftChangeRequestId_idx" ON "shift_change_applications"("shiftChangeRequestId");

CREATE INDEX "shift_change_policies_organizationId_branchId_departmentId_idx" ON "shift_change_policies"("organizationId", "branchId", "departmentId");
