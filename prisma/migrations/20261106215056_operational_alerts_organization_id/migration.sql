-- 1. Add nullable organizationId column
ALTER TABLE "operational_alerts" ADD COLUMN "organizationId" TEXT;

-- 2. Backfill organizationId from department's organizationId
UPDATE "operational_alerts" oa
SET "organizationId" = d."organizationId"
FROM "departments" d
WHERE oa."departmentId" = d."id";

-- 3. Make organizationId NOT NULL (all existing rows now have a value)
ALTER TABLE "operational_alerts" ALTER COLUMN "organizationId" SET NOT NULL;

-- 4. Add indexes for org-scoped queries
CREATE INDEX IF NOT EXISTS "operational_alerts_organizationId_idx" ON "operational_alerts"("organizationId");
CREATE INDEX IF NOT EXISTS "operational_alerts_organizationId_departmentId_idx" ON "operational_alerts"("organizationId", "departmentId");
