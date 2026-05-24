/*
  Warnings:

  - Added the required column `departmentId` to the `leaves` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `vacations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "leaves" ADD COLUMN     "departmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vacations" ADD COLUMN     "departmentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "vacations" ADD CONSTRAINT "vacations_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
