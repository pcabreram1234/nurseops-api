-- 1. Add nullable organizationId column
ALTER TABLE "optimization_runs" ADD COLUMN "organizationId" TEXT;

-- 2. Backfill organizationId from associated schedule
UPDATE "optimization_runs" oa
SET "organizationId" = s."organizationId"
FROM "schedules" s
WHERE oa."scheduleId" = s."id";

-- 3. Make organizationId NOT NULL (all existing rows now have a value via schedule)
ALTER TABLE "optimization_runs" ALTER COLUMN "organizationId" SET NOT NULL;

-- 4. Add indexes for org-scoped queries
CREATE INDEX IF NOT EXISTS "optimization_runs_organizationId_idx" ON "optimization_runs"("organizationId");
CREATE INDEX IF NOT EXISTS "optimization_runs_org_sched_idx" ON "optimization_runs"("organizationId", "scheduleId");
