-- AlterTable: add phone/need with a temporary default so existing rows stay valid,
-- and make message optional (no longer collected by the contact action)
ALTER TABLE "ContactSubmission"
ALTER COLUMN "message" DROP NOT NULL,
ADD COLUMN "need" TEXT NOT NULL DEFAULT '',
ADD COLUMN "phone" TEXT NOT NULL DEFAULT '';

-- Drop the temporary default now that existing rows are backfilled with '' —
-- matches the schema (no @default), new inserts must supply a real value
ALTER TABLE "ContactSubmission" ALTER COLUMN "need" DROP DEFAULT;
ALTER TABLE "ContactSubmission" ALTER COLUMN "phone" DROP DEFAULT;
