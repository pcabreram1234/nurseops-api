-- ============================================================================
-- Branch (Sedes) relationship normalization
--
-- This migration is intentionally written in a data-safe order:
--   1. Create the Department <-> Branch join table.
--   2. Backfill it from the legacy departments.branchId column.
--   3. Add the new branch columns as NULLABLE and backfill them.
--   4. Enforce NOT NULL only once every row has a safe value.
--   5. Drop the legacy column and recreate constraints/indexes.
--   6. Install integrity triggers for cross-organization consistency.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Department <-> Branch (N:M)
-- ----------------------------------------------------------------------------
CREATE TABLE "department_branches" (
    "departmentId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "department_branches_pkey" PRIMARY KEY ("departmentId","branchId")
);

CREATE INDEX "department_branches_branchId_idx" ON "department_branches"("branchId");

-- Preserve the pre-existing 1:N relationship as the primary branch of each
-- department. No department is left without a branch.
INSERT INTO "department_branches" ("departmentId", "branchId", "isPrimary")
SELECT "id", "branchId", true
FROM "departments"
WHERE "branchId" IS NOT NULL
ON CONFLICT ("departmentId", "branchId") DO NOTHING;

-- Exactly one primary branch per department.
CREATE UNIQUE INDEX "department_branches_one_primary_key"
    ON "department_branches"("departmentId")
    WHERE "isPrimary" = true;

-- ----------------------------------------------------------------------------
-- 2. Add nullable branch columns
-- ----------------------------------------------------------------------------
ALTER TABLE "absences"            ADD COLUMN "branchId" TEXT;
ALTER TABLE "leaves"              ADD COLUMN "branchId" TEXT;
ALTER TABLE "nurse_availability"  ADD COLUMN "branchId" TEXT;
ALTER TABLE "nurses"              ADD COLUMN "branchId" TEXT;
ALTER TABLE "schedule_entries"    ADD COLUMN "branchId" TEXT;
ALTER TABLE "schedules"           ADD COLUMN "branchId" TEXT;
ALTER TABLE "shift_templates"     ADD COLUMN "branchId" TEXT;
ALTER TABLE "shifts"              ADD COLUMN "branchId" TEXT;
ALTER TABLE "users"               ADD COLUMN "branchId" TEXT;
ALTER TABLE "vacations"           ADD COLUMN "branchId" TEXT;
ALTER TABLE "emergency_coverages" ADD COLUMN "branchId" TEXT;

-- Shift templates become branch-scoped. A template may still be narrowed to a
-- single department (departmentId), but branchId is the required scope.
ALTER TABLE "shift_templates" ALTER COLUMN "departmentId" DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. Data backfill (only where the value can be inferred safely)
-- ----------------------------------------------------------------------------
-- Primary branch helper: one row per department (the partial unique index
-- above guarantees it). Rows without a department are left untouched.
UPDATE "schedules" s
SET "branchId" = db."branchId"
FROM "department_branches" db
WHERE db."departmentId" = s."departmentId" AND db."isPrimary" = true
  AND s."branchId" IS NULL;

UPDATE "schedule_entries" se
SET "branchId" = s."branchId"
FROM "schedules" s
WHERE s."id" = se."scheduleId" AND se."branchId" IS NULL;

UPDATE "shift_templates" st
SET "branchId" = db."branchId"
FROM "department_branches" db
WHERE db."departmentId" = st."departmentId" AND db."isPrimary" = true
  AND st."branchId" IS NULL;

UPDATE "shifts" sh
SET "branchId" = db."branchId"
FROM "department_branches" db
WHERE db."departmentId" = sh."departmentId" AND db."isPrimary" = true
  AND sh."branchId" IS NULL;

UPDATE "nurses" n
SET "branchId" = db."branchId"
FROM "department_branches" db
WHERE db."departmentId" = n."departmentId" AND db."isPrimary" = true
  AND n."branchId" IS NULL;

UPDATE "users" u
SET "branchId" = db."branchId"
FROM "department_branches" db
WHERE db."departmentId" = u."departmentId" AND db."isPrimary" = true
  AND u."branchId" IS NULL;

UPDATE "absences" a
SET "branchId" = COALESCE(n."branchId", db."branchId")
FROM "nurses" n
LEFT JOIN "department_branches" db
       ON db."departmentId" = n."departmentId" AND db."isPrimary" = true
WHERE n."id" = a."nurseId" AND a."branchId" IS NULL;

UPDATE "vacations" v
SET "branchId" = COALESCE(n."branchId", db."branchId")
FROM "nurses" n
LEFT JOIN "department_branches" db
       ON db."departmentId" = n."departmentId" AND db."isPrimary" = true
WHERE n."id" = v."nurseId" AND v."branchId" IS NULL;

UPDATE "nurse_availability" na
SET "branchId" = COALESCE(n."branchId", db."branchId")
FROM "nurses" n
LEFT JOIN "department_branches" db
       ON db."departmentId" = n."departmentId" AND db."isPrimary" = true
WHERE n."id" = na."nurseId" AND na."branchId" IS NULL;

UPDATE "leaves" l
SET "branchId" = COALESCE(u."branchId", db."branchId")
FROM "users" u
LEFT JOIN "department_branches" db
       ON db."departmentId" = u."departmentId" AND db."isPrimary" = true
WHERE u."id" = l."userId" AND l."branchId" IS NULL;

UPDATE "emergency_coverages" ec
SET "branchId" = COALESCE(
    (
        SELECT d."branchId"
        FROM "department_branches" d
        WHERE d."departmentId" = ec."departmentId" AND d."isPrimary" = true
        LIMIT 1
    ),
    (
        SELECT sd."branchId"
        FROM "shifts" s
        JOIN "department_branches" sd
          ON sd."departmentId" = s."departmentId" AND sd."isPrimary" = true
        WHERE s."id" = ec."shiftId"
        LIMIT 1
    )
)
WHERE ec."branchId" IS NULL;

-- ----------------------------------------------------------------------------
-- 4. Enforce NOT NULL now that every row has a value
-- ----------------------------------------------------------------------------
ALTER TABLE "schedules"           ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "shift_templates"     ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "emergency_coverages" ALTER COLUMN "branchId" SET NOT NULL;

-- ----------------------------------------------------------------------------
-- 5. Drop legacy 1:N column and old unique indexes
-- ----------------------------------------------------------------------------
ALTER TABLE "departments" DROP CONSTRAINT "departments_branchId_fkey";
ALTER TABLE "departments" DROP COLUMN "branchId";

DROP INDEX "departments_code_key";
DROP INDEX "schedules_departmentId_month_year_key";
DROP INDEX "shifts_code_key";

-- ----------------------------------------------------------------------------
-- 6. New indexes and unique constraints
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX "branches_organizationId_name_key" ON "branches"("organizationId", "name");

CREATE UNIQUE INDEX "branches_one_main_per_org_key"
    ON "branches"("organizationId")
    WHERE "isMainBranch" = true;

CREATE UNIQUE INDEX "departments_organizationId_code_key" ON "departments"("organizationId", "code");
CREATE UNIQUE INDEX "schedules_departmentId_branchId_month_year_key" ON "schedules"("departmentId", "branchId", "month", "year");
CREATE UNIQUE INDEX "shifts_organizationId_code_key" ON "shifts"("organizationId", "code");

CREATE INDEX "absences_branchId_idx"            ON "absences"("branchId");
CREATE INDEX "emergency_coverages_branchId_idx" ON "emergency_coverages"("branchId");
CREATE INDEX "leaves_branchId_idx"              ON "leaves"("branchId");
CREATE INDEX "nurse_availability_branchId_idx"  ON "nurse_availability"("branchId");
CREATE INDEX "nurses_branchId_idx"              ON "nurses"("branchId");
CREATE INDEX "schedule_entries_branchId_idx"    ON "schedule_entries"("branchId");
CREATE INDEX "shift_templates_branchId_idx"     ON "shift_templates"("branchId");
CREATE INDEX "shift_templates_departmentId_idx" ON "shift_templates"("departmentId");
CREATE INDEX "shifts_branchId_idx"              ON "shifts"("branchId");
CREATE INDEX "users_branchId_idx"               ON "users"("branchId");
CREATE INDEX "vacations_branchId_idx"           ON "vacations"("branchId");

-- ----------------------------------------------------------------------------
-- 7. Foreign keys
-- ----------------------------------------------------------------------------
ALTER TABLE "department_branches" ADD CONSTRAINT "department_branches_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "department_branches" ADD CONSTRAINT "department_branches_branchId_fkey"     FOREIGN KEY ("branchId")     REFERENCES "branches"("id")    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "absences"            ADD CONSTRAINT "absences_branchId_fkey"            FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "emergency_coverages" ADD CONSTRAINT "emergency_coverages_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leaves"              ADD CONSTRAINT "leaves_branchId_fkey"              FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nurse_availability"  ADD CONSTRAINT "nurse_availability_branchId_fkey"  FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nurses"              ADD CONSTRAINT "nurses_branchId_fkey"              FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "schedule_entries"    ADD CONSTRAINT "schedule_entries_branchId_fkey"    FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "schedules"           ADD CONSTRAINT "schedules_branchId_fkey"           FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shift_templates"     ADD CONSTRAINT "shift_templates_branchId_fkey"     FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shifts"              ADD CONSTRAINT "shifts_branchId_fkey"              FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users"               ADD CONSTRAINT "users_branchId_fkey"               FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vacations"           ADD CONSTRAINT "vacations_branchId_fkey"           FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------------------------------------------------------
-- 8. Cross-organization integrity triggers
--
-- A foreign key only proves that the branch exists, not that it belongs to the
-- same organization as the row. These triggers close that gap at the database
-- level (the services also validate it for friendlier error messages).
-- ----------------------------------------------------------------------------

-- 8.1 Any row that has branchId + organizationId must use a branch of its org.
CREATE OR REPLACE FUNCTION "assert_branch_belongs_to_organization"()
RETURNS trigger AS $$
DECLARE
    row_org_id    text;
    branch_org_id text;
BEGIN
    IF NEW."branchId" IS NULL THEN
        RETURN NEW;
    END IF;

    row_org_id := COALESCE(
        to_jsonb(NEW) ->> 'organizationId',
        to_jsonb(NEW) ->> 'organiztionId'
    );

    SELECT "organizationId" INTO branch_org_id
    FROM "branches"
    WHERE "id" = NEW."branchId";

    IF branch_org_id IS NULL THEN
        RAISE EXCEPTION 'Branch % does not exist', NEW."branchId"
            USING ERRCODE = '23503';
    END IF;

    IF row_org_id IS NOT NULL AND branch_org_id <> row_org_id THEN
        RAISE EXCEPTION 'Branch % belongs to organization %, not to organization %',
            NEW."branchId", branch_org_id, row_org_id
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users', 'nurses', 'schedules', 'schedule_entries', 'shifts',
        'shift_templates', 'absences', 'vacations', 'leaves',
        'nurse_availability', 'emergency_coverages'
    ]
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS %I ON %I',
            'trg_' || t || '_branch_org',
            t
        );
        EXECUTE format(
            'CREATE TRIGGER %I BEFORE INSERT OR UPDATE OF "branchId" ON %I
             FOR EACH ROW EXECUTE FUNCTION "assert_branch_belongs_to_organization"()',
            'trg_' || t || '_branch_org',
            t
        );
    END LOOP;
END;
$$;

-- 8.2 A department can only be linked to branches of its own organization.
CREATE OR REPLACE FUNCTION "assert_department_branch_same_organization"()
RETURNS trigger AS $$
DECLARE
    dept_org_id   text;
    branch_org_id text;
BEGIN
    SELECT "organizationId" INTO dept_org_id
    FROM "departments" WHERE "id" = NEW."departmentId";

    SELECT "organizationId" INTO branch_org_id
    FROM "branches" WHERE "id" = NEW."branchId";

    IF dept_org_id IS NULL THEN
        RAISE EXCEPTION 'Department % does not exist', NEW."departmentId"
            USING ERRCODE = '23503';
    END IF;
    IF branch_org_id IS NULL THEN
        RAISE EXCEPTION 'Branch % does not exist', NEW."branchId"
            USING ERRCODE = '23503';
    END IF;
    IF dept_org_id <> branch_org_id THEN
        RAISE EXCEPTION 'Department % and branch % belong to different organizations',
            NEW."departmentId", NEW."branchId"
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_department_branches_same_org" ON "department_branches";
CREATE TRIGGER "trg_department_branches_same_org"
    BEFORE INSERT OR UPDATE ON "department_branches"
    FOR EACH ROW EXECUTE FUNCTION "assert_department_branch_same_organization"();

-- 8.3 A schedule may only use a branch in which its department operates.
CREATE OR REPLACE FUNCTION "assert_schedule_branch_serves_department"()
RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM "department_branches"
        WHERE "departmentId" = NEW."departmentId"
          AND "branchId"     = NEW."branchId"
    ) THEN
        RAISE EXCEPTION 'Department % does not operate in branch %',
            NEW."departmentId", NEW."branchId"
            USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_schedules_branch_serves_department" ON "schedules";
CREATE TRIGGER "trg_schedules_branch_serves_department"
    BEFORE INSERT OR UPDATE OF "departmentId", "branchId" ON "schedules"
    FOR EACH ROW EXECUTE FUNCTION "assert_schedule_branch_serves_department"();

-- 8.4 A schedule entry inherits (and must match) the branch of its schedule.
CREATE OR REPLACE FUNCTION "assert_schedule_entry_branch_matches_schedule"()
RETURNS trigger AS $$
DECLARE
    schedule_branch_id text;
BEGIN
    SELECT "branchId" INTO schedule_branch_id
    FROM "schedules" WHERE "id" = NEW."scheduleId";

    IF schedule_branch_id IS NULL THEN
        RAISE EXCEPTION 'Schedule % does not exist', NEW."scheduleId"
            USING ERRCODE = '23503';
    END IF;

    IF NEW."branchId" IS NULL THEN
        NEW."branchId" := schedule_branch_id;
    ELSIF NEW."branchId" <> schedule_branch_id THEN
        RAISE EXCEPTION 'Schedule entry branch % does not match schedule branch %',
            NEW."branchId", schedule_branch_id
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_schedule_entries_branch_matches_schedule" ON "schedule_entries";
CREATE TRIGGER "trg_schedule_entries_branch_matches_schedule"
    BEFORE INSERT OR UPDATE OF "branchId", "scheduleId" ON "schedule_entries"
    FOR EACH ROW EXECUTE FUNCTION "assert_schedule_entry_branch_matches_schedule"();

-- 8.5 Shifts and shift templates: when narrowed to a department, the branch
--     must be one in which that department operates. If branchId is omitted,
--     the primary branch of the department is used.
CREATE OR REPLACE FUNCTION "assert_department_resource_branch"()
RETURNS trigger AS $$
DECLARE
    primary_branch_id text;
BEGIN
    IF NEW."departmentId" IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW."branchId" IS NULL THEN
        SELECT "branchId" INTO primary_branch_id
        FROM "department_branches"
        WHERE "departmentId" = NEW."departmentId"
        ORDER BY "isPrimary" DESC
        LIMIT 1;

        NEW."branchId" := primary_branch_id;
    END IF;

    IF NEW."branchId" IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM "department_branches"
        WHERE "departmentId" = NEW."departmentId"
          AND "branchId"     = NEW."branchId"
    ) THEN
        RAISE EXCEPTION 'Department % does not operate in branch %',
            NEW."departmentId", NEW."branchId"
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_shifts_department_branch" ON "shifts";
CREATE TRIGGER "trg_shifts_department_branch"
    BEFORE INSERT OR UPDATE OF "departmentId", "branchId" ON "shifts"
    FOR EACH ROW EXECUTE FUNCTION "assert_department_resource_branch"();

DROP TRIGGER IF EXISTS "trg_shift_templates_department_branch" ON "shift_templates";
CREATE TRIGGER "trg_shift_templates_department_branch"
    BEFORE INSERT OR UPDATE OF "departmentId", "branchId" ON "shift_templates"
    FOR EACH ROW EXECUTE FUNCTION "assert_department_resource_branch"();

-- 8.6 Emergency coverages: when a department is present, the branch must be
--     one in which that department operates.
CREATE OR REPLACE FUNCTION "assert_coverage_branch_serves_department"()
RETURNS trigger AS $$
BEGIN
    IF NEW."departmentId" IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM "department_branches"
        WHERE "departmentId" = NEW."departmentId"
          AND "branchId"     = NEW."branchId"
    ) THEN
        RAISE EXCEPTION 'Department % does not operate in branch %',
            NEW."departmentId", NEW."branchId"
            USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_emergency_coverages_branch_serves_department" ON "emergency_coverages";
CREATE TRIGGER "trg_emergency_coverages_branch_serves_department"
    BEFORE INSERT OR UPDATE OF "departmentId", "branchId" ON "emergency_coverages"
    FOR EACH ROW EXECUTE FUNCTION "assert_coverage_branch_serves_department"();
