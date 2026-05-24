/*
  Warnings:

  - Made the column `minimum_staff` on table `department_specialties` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `coveragePercentage` to the `optimization_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `optimization_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executionTimeMs` to the `optimization_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slotsCovered` to the `optimization_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSlotsProcessed` to the `optimization_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationHours` to the `shift_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isNightShift` to the `shift_templates` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `shift_templates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "ScheduleEntryStatus" ADD VALUE 'OPEN';

-- AlterTable
ALTER TABLE "department_specialties" ALTER COLUMN "minimum_staff" SET NOT NULL;

-- AlterTable
ALTER TABLE "optimization_runs" ADD COLUMN     "coveragePercentage" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "departmentId" TEXT NOT NULL,
ADD COLUMN     "executionTimeMs" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "slotsCovered" INTEGER NOT NULL,
ADD COLUMN     "totalSlotsProcessed" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "shift_templates" ADD COLUMN     "durationHours" INTEGER NOT NULL,
ADD COLUMN     "isNightShift" BOOLEAN NOT NULL,
ADD COLUMN     "minimum_staff" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "name",
ADD COLUMN     "name" "PreferredShift" NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "auditLogId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "optimization_runs" ADD CONSTRAINT "optimization_runs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
