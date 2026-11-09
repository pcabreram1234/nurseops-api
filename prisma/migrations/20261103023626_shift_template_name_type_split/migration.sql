-- 1. Add new `type` column (nullable initially to handle existing rows)
ALTER TABLE "shift_templates" ADD COLUMN "type" "PreferredShift";

-- 2. Copy existing `name` values to `type`
UPDATE "shift_templates" SET "type" = "name";

-- 3. Make `type` not null (all existing rows now have a value)
ALTER TABLE "shift_templates" ALTER COLUMN "type" SET NOT NULL;

-- 4. Drop old `name` column
ALTER TABLE "shift_templates" DROP COLUMN "name";

-- 5. Add new `name` column (TEXT, nullable - user-filled name in their language)
ALTER TABLE "shift_templates" ADD COLUMN "name" TEXT;
