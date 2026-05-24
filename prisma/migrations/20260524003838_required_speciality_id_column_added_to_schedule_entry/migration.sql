/*
  Warnings:

  - Added the required column `requiredSpecialityId` to the `schedule_entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedule_entries" ADD COLUMN     "requiredSpecialityId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "schedule_entries" ADD CONSTRAINT "schedule_entries_requiredSpecialityId_fkey" FOREIGN KEY ("requiredSpecialityId") REFERENCES "specialities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
