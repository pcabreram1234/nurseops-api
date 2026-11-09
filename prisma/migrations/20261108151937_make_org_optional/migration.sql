-- 1. Make organizationId nullable
ALTER TABLE "optimization_runs" ALTER COLUMN "organizationId" DROP NOT NULL;
