-- AlterTable
ALTER TABLE "users" ADD COLUMN "siapp" TEXT;

-- Backfill existing rows so the column can become NOT NULL
UPDATE "users" SET "siapp" = "id" WHERE "siapp" IS NULL;

ALTER TABLE "users" ALTER COLUMN "siapp" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_siapp_key" ON "users"("siapp");
